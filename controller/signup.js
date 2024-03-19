const User = require("../models/user")
const bcrypt = require('bcryptjs');

function signup(req, res) {
    const { name, email, password, subscribeNewsletter } = req.body;
    const regExForUsername = /^[a-zA-Z]{3,}$/;
    const regExForPassword = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).{8,}$/;
    const regExForEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isSubscribedNews = false;
    if (subscribeNewsletter) {
        isSubscribedNews = true;
    }

    if (name.trim() === '' || email.trim() === '' || password.trim() === '' || !regExForUsername.test(name) || !regExForPassword.test(password) || !regExForEmail.test(email)) {
        res.status(401).send("Invalid user credentials.");
    }

    bcrypt.genSalt(10)
        .then(salt => {
            // Hash the password with the generated salt
            return bcrypt.hash(password, salt);
        })
        .then(hashedPassword => {
            let password = hashedPassword;
            const newUser = new User({
                name,
                email,
                password,
                isSubscribedNews
            });

            newUser.save()
                .then(() => {
                    res.redirect('/login');
                })
                .catch(err => {
                    console.error('Error saving user:', err);
                    res.status(500).send(`Error saving user ${err}`);
                });

        })
        .catch(err => {
            console.error(err);
        });

}

module.exports = signup;