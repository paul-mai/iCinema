const User = require('../models/user');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');


exports.SIGN_UP = (req, res, next) => {
    User
    .find({ email: req.body.email })    //Checking if the email exist
    .then(user => {
        if(user.length > 0) res.status(409).json({ error: "The entered Email already exist!" })
        else {
            //Hashing the password
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if(err) res.status(500).json({ error: err })
                else {
                    const newUser = new User({
                        _id: mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    });

                    newUser
                    .save()
                    .then(() => res.status(201).json({ message: "The user has been signed up successfully!" }))
                    .catch((err) => res.status(500).json({ error: err }));
                }
            });
        }
    });
}

exports.SIGN_IN = (req, res, next) => {
    User
    .find({ email: req.body.email }, (err, user) => {
        if(err || user.length === 0) res.status(404).json({ error: "No user was found with this email." })
        else if(user.length > 0) {
        
            //Comparing password
            bcrypt.compare(req.body.password, user[0].password, (_err, result) => {
                if(_err) res.status(401).json({ error: "Authentication has failed!" });
                else if (result)
                {
                    const userData =  { email: user[0].email, ID: user[0]._id, favouriteMovies: user[0].favouriteMovies }
                    const token = jwt.sign(userData, "MONGO_SECRET",{ expiresIn: '1h' } );
                    res.status(200).json({ message: "Authentication has been successful", token: token, userData })
                }
                else res.status(401).json({ error: "The password entered is incorrect!" });
            });
        }
    })
    .catch((err) => res.status(500).json({ error: err }));
}

exports.UPDATE_USER = (req, res, next) => {
    const userID = req.params.userID;

    User
    .updateMany({ _id: userID}, { $set: req.body })
    .then(result => result.state(200).json(result)) 
    .catch(error => res.status(409).json(error))
}

 
exports.DELETE_USER = (req, res, next) => {
    User.remove({ _id: req.params.userID })
    .then(result => { 
        if(result.length > 0) res.status(200).json({ message: "User has been deleted" }) 
        else res.status(404).json({ message: "No user was found with this ID" })
    })
    .catch(error => res.status(200).json(error));
}