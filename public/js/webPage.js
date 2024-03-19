let docStatus = "Draft";
var documentData = {}; // Declare documentData as a global object

var quill = new Quill('#editor-container', {
    theme: 'snow',
    modules: {
        toolbar: [
            [{ 'font': [] }, { 'size': [] }],
            [{ 'header': '1' }, 'bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub' }, { 'script': 'super' }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'indent': '-1' }, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }, { 'align': [] }],
            ['link', 'image'],
        ]
    }
});

document.getElementById("deleteBtn").onclick = () => {location.href = '/'}

async function saveImages(docBody) {
    // Regular expression to find image URLs in the Quill editor's HTML
    const imgRegex = /<img[^>]+src="([^">]+)"/g;
    const imgUrls = [...docBody.matchAll(imgRegex)].map(match => match[1]);
    const uploadedUrls = [];

    // Handle image uploads
    for (const imgUrl of imgUrls) {
        try {
            // Create a new FormData object and append the image Blob
            const formData = new FormData();
            formData.append('file', imgUrl); // Append the image URL with key 'file'
            console.log("this is form data: ",formData);

            // Upload the image to Cloudinary
            const response = await fetch("/upload-images", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ htmlContent: docBody })
            });

            if (response.ok) {
                console.log("image uploaded");
                const data = await response.json();
                console.log("data if url: ",data);
                uploadedUrls.push(data.uploadedUrls);
            } else {
                console.error('Failed to upload image:', imgUrl);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    }

    return uploadedUrls;
}


async function saveDocuments() {
    const fileInput = document.getElementById("fileInput");
    const files = fileInput.files;
    const uploadedUrls = [];

    // Handle document uploads
    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/upload-document', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            uploadedUrls.push(data.url);
        } else {
            console.error('Failed to upload document:', file.name);
        }
    }

    return uploadedUrls;
}

async function saveData() {
    const docTitle = document.getElementById("title").value;
    const docSubtext = document.getElementById("subtext").value;
    let docBody = quill.root.innerHTML;
    const docLink = document.getElementById("linkInput").value;
    const docAuthor = document.getElementById("authorInput").value;
    const showAuthor = document.getElementById("showAuthorCheckbox").checked;

    const uploadedImages = await saveImages(docBody);
    const uploadedDocuments = await saveDocuments();

    console.log(uploadedImages);

    documentData.title = docTitle;
    documentData.subtext = docSubtext;
    documentData.body = JSON.stringify(replaceImagesWithLinks(docBody, uploadedImages));
    documentData.attachments = JSON.stringify(uploadedDocuments);
    documentData.link = docLink;
    documentData.author = docAuthor;
    documentData.showAuthor = showAuthor;
    documentData.status = docStatus;

    if(document.getElementById('saveBtn').textContent === 'Update'){
        updateBackend(documentData);
    }else{
        saveBackend(documentData);
    }
}

async function updateBackend(documentData) {
    const docSaved = await fetch("/update-document", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(documentData)
    });

    if (docSaved.ok) {
        console.log("Document saved successfully");
        // Redirect to the dashboard
        window.location.href = "/";
    } else {
        console.error("Failed to save document:", response.statusText);
    }
}

async function saveBackend(documentData) {
    const docSaved = await fetch("/save-document", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(documentData)
    });

    if (docSaved.ok) {
        console.log("Document saved successfully");
        // Redirect to the dashboard
        window.location.href = "/";
    } else {
        console.error("Failed to save document:", response.statusText);
    }
}

document.getElementById('datetimePicker').addEventListener('click', function () {
    const currentDateTime = new Date().toISOString().slice(0, 16);
    document.getElementById('dateTimePicker').setAttribute('min', currentDateTime);
    document.getElementById('datePickerOverlay').style.display = 'flex';
});

document.getElementById('cancelButton').addEventListener('click', function () {
    document.getElementById('datePickerOverlay').style.display = 'none';
});

document.getElementById('confirmButton').addEventListener('click', function () {
    const selectedDateTime = document.getElementById('dateTimePicker').value;
    console.log('Selected date and time:', selectedDateTime);
    docStatus = "Scheduled";
    documentData.schedule = selectedDateTime;
    saveData();
    document.getElementById('datePickerOverlay').style.display = 'none';
});

function mapDocumentToPageFields() {
    // Check if the 'document' cookie exists
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(';');

    // Find the cookie with the specified name
    const documentCookie = cookieArray.find(cookie => cookie.trim().startsWith(`document=`));

    console.log(documentCookie);

    if (documentCookie) {
        try {
            // Parse the document data from the cookie
            console.log('{',documentCookie.split('{')[1]);
            const documentData = JSON.parse('{'+documentCookie.split('{')[1]);
            return documentData;
        } catch (error) {
            console.error('Error parsing document data from cookie:', error);
            return null;
        }
    } else {
        console.error('Document cookie not found.');
        return null;
    }
}

// Example usage:
const pageData = mapDocumentToPageFields();
if (pageData) {
    document.getElementById("title").value = pageData.title;
    document.getElementById("subtext").value = pageData.subtext;
    quill.root.innerHTML = JSON.parse(pageData.body);
    document.getElementById("linkInput").value = pageData.link;
    document.getElementById("authorInput").value = pageData.author;
    document.getElementById("showAuthorCheckbox").checked = pageData.showAuthor;
    document.getElementById("titleLabel").textContent = pageData.title;
    document.getElementById("deleteBtn").onclick = () => { deletePage(pageData._id)};
    documentData.id = pageData._id;
    const btn =  document.getElementById("saveBtn");
    btn.textContent = "Update";
    const statusLabel = document.getElementById("statusLabel")
    if (pageData.status === 'Draft') {
        statusLabel.textContent = 'Draft';
        statusLabel.classList.add('status-draft');
    } else if (pageData.status === 'Published') {
        statusLabel.textContent = 'Published';
        statusLabel.classList.add('status-published');
    } else if (pageData.status === 'Scheduled') {
        statusLabel.textContent = 'Scheduled';
        statusLabel.classList.add('status-scheduled');
    } else {
        // Default status if none of the conditions are met
        statusLabel.textContent = 'Unknown Status';
    }
    // Now you can use the mapped page fields as needed
} else {
    console.error('Failed to map page fields.');
}

function replaceImagesWithLinks(docBody, imageLinks) {
    // Create a temporary div element to parse the docBody HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = docBody;

    // Get all image elements within the tempDiv
    const images = tempDiv.querySelectorAll('img');

    // Loop through each image element
    images.forEach((image, index) => {
        // Check if there is a corresponding link available in the imageLinks array
        if (index < imageLinks.length) {
            const newSrc = imageLinks[index]; // Get the link from the array
            image.src = newSrc; // Replace the src attribute with the link
        } else {
            // If there are more images than links, handle it as needed
            console.error('Not enough links available for all images.');
        }
    });

    // Return the modified HTML content
    return tempDiv.innerHTML;
}

function previewContent() {
    // Get the values of title, subtext, and body fields
    const title = document.getElementById('title').value;
    const subtext = document.getElementById('subtext').value;
    const body = quill.root.innerHTML;

    // Construct the HTML content for the preview
    const previewContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Preview</title>
        </head>
        <body>
            <h1>${title}</h1>
            <p>${subtext}</p>
            <div>${body}</div>
        </body>
        </html>
    `;

    // Open a new tab and write the preview content to it
    const previewWindow = window.open();
    previewWindow.document.open();
    previewWindow.document.write(previewContent);
    previewWindow.document.close();
}

async function deletePage(itemId) {
    const response = await fetch('/delete-document', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemId: itemId })
    });

    if (response.ok) {
        // Handle successful response
        console.log('Row deleted successfully.');
        location.href = '/';
    } else {
        console.error('Failed to delete row:', response.statusText);
    }
}

window.addEventListener('unload', function(event) {
    document.cookie = 'document=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
});