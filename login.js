// import required functions
import {
	getAuth,
	createUserWithEmailAndPassword,
	sendEmailVerification,
	signInWithEmailAndPassword,
	onAuthStateChanged,
	GoogleAuthProvider,
	signInWithPopup,
	signOut,
	sendPasswordResetEmail,
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-auth.js";
import {
	getFirestore,
	collection,
	doc,
	addDoc,
	setDoc,
	query,
	where,
	getDoc,
	getDocs,
} from "https://www.gstatic.com/firebasejs/9.6.11/firebase-firestore.js";

const loginBtn = document.querySelector(".login-btn");
const logoutBtn = document.querySelector(".logout-btn");

const auth = getAuth();
const db = getFirestore();
const provider = new GoogleAuthProvider();

const register = document.querySelector(".register");
const login = document.querySelector(".elogin");
// const sOut = document.querySelector(".sign-out");
const googleLogin = document.querySelector(".glogin");
const googleSignUp = document.querySelector(".google-reg");

const loginUserNameValue = document.querySelector(".email");
const loginPasswordValue = document.querySelector(".password");
const forgotPassword = document.querySelector(".forgot-password");

const userNameValue = document.querySelector(".username-value");
const collegeValue = document.querySelector(".college-value");
const mailValue = document.querySelector(".mail-value");
const passwordValue = document.querySelector(".password-value");

// grab the form and prevent default behaviour which is sending PHP request
const form = document.querySelector(".register-form");
form.onsubmit = function (e) {
	e.preventDefault();
};

const writeUserData = async (user) => {
	console.log(user);
	const docRef = doc(db, "users", user.uid);
	await setDoc(docRef, {
		userName: user.displayName,
		college: "",
		mail: user.email,
		event: [
			{
				nameOfEvent: "",
				ref: doc(db, user, user.id),
			},
		],
	});
};

const registerUser = () => {
	const emailValue = mailValue.value;
	const passwordCode = passwordValue.value;

	createUserWithEmailAndPassword(auth, emailValue, passwordCode)
		.then((userCredential) => {
			const user = userCredential.user;
			console.log("USER", user);
			sendEmailVerification(auth.currentUser).then(() => {
				console.log("VERIFICATION MAIL SENT");
			});
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			console.log("error message", errorMessage);
		});
};

const loginUser = () => {
	const emailValue = document.querySelector(".login-email");
	const passwordCode = document.querySelector(".login-password");
	console.log("values", emailValue, passwordValue);
	const user = auth.currentUser;
	if (user.emailVerified) {
		signInWithEmailAndPassword(auth, emailValue.value, passwordCode.value)
			.then((userCredential) => {
				const user = userCredential.user;
				console.log("SIGNED IN", user);
				// grab data from registeration form and pass it as arguments for writing user data
				writeUserData(user);
			})
			.catch((error) => {
				const errorCode = error.code;
				const errorMessage = error.message;
				console.log("ERROR", errorMessage);
			});
	} else {
		console.log("get email verified");
	}
};

const loginByGoogle = () => {
	signInWithPopup(auth, provider)
		.then((result) => {
			// This gives you a Google Access Token. You can use it to access the Google API.
			const credential = GoogleAuthProvider.credentialFromResult(result);
			const token = credential.accessToken;
			// The signed-in user info.
			const user = result.user;
			console.log("GOOGLE SIGN IN SUCCESSFUL", user);
			// pass required data as arguments to this function to write user data
			writeUserData(user);
			// ...
		})
		.catch((error) => {
			// Handle Errors here.
			const errorCode = error.code;
			const errorMessage = error.message;
			console.log(errorMessage);
			// The email of the user's account used.
			const email = error.email;
			// The AuthCredential type that was used.
			const credential = GoogleAuthProvider.credentialFromError(error);
			// ...
		});
};

const updateUserData = () => {
	onAuthStateChanged(auth, (user) => {
		if (user) {
			// User is signed in, see docs for a list of available properties
			// https://firebase.google.com/docs/reference/js/firebase.User
			const uid = user.uid;
			console.log("ON AUTH STATE CHANGE EVENT FIRED", user);
			// ...
		} else {
			// User is signed out
			// ...
		}
	});
};

const signOutUser = () => {
	signOut(auth)
		.then(() => {
			console.log("Sign-out successful");
		})
		.catch((error) => {
			console.log("Sign-out un-successful", error);
			// An error happened.
		});
};

const resetPassword = () => {
	let email = window.prompt("Enter your email: ");
	sendPasswordResetEmail(auth, email)
		.then(() => {
			// Password reset email sent!
			console.log("password reset mail sent");
			// ..
		})
		.catch((error) => {
			const errorCode = error.code;
			const errorMessage = error.message;
			// ..
		});
};

register.addEventListener("click", registerUser);
login.addEventListener("click", loginUser);
forgotPassword.addEventListener("click", resetPassword);
googleLogin.addEventListener("click", loginByGoogle);
googleSignUp.addEventListener("click", loginByGoogle);
updateUserData();

logoutBtn.addEventListener("click", signOutUser);

const profileIcon = document.querySelector("#nav-link-account");

onAuthStateChanged(auth, (user) => {
	if (user) {
		profileIcon.classList.add("--logged-in");
		profileIcon.classList.remove("show-modal");
	} else {
		profileIcon.classList.remove("--logged-in");
		// User is signed out
		// ...
	}
});
