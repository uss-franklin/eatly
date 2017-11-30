//provides basic login / signup / logout features for users
//all successfully signed up users are visible online at the firebase GUI console

const config = require('./keys/firebaseAuthConfig.js');

firebase.initializeApp(config);

//these reference elements defined in the signup component
const txtEmail = document.getElementById('txtEmail');
const txtPassword = document.getElementById('txtPassword');
const btnLogin = document.getElementById('btnLogin');
const btnSignUp = document.getElementById('btnSignUp');
const btnLogout = document.getElementById('btnLogout');


//attaches the log-in feature to the login button of the signup component
btnLogin.addEventListener('click', e => {
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
})


//attaches the signup feature to the signup button of the signup component
btnSignUp.addEventListener('click', e => {
    //TO DO: add check for valid email input
    const email = txtEmail.value;
    const pass = txtPassword.value;
    const auth = firebase.auth();

    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(e => console.log(e.message));
})

//attaches the signout feature to the signout button of the signup component
btnLogout.addEventListener('click', e => {
    firebase.auth().signOut();
})


//real time listener for any authentication change
firebase.auth().onAuthStateChanged(firebaseUser => {
    if(firebaseUser) {
        console.log(firebaseUser);
    } else {
        console.log('not logged in');
        }
})
