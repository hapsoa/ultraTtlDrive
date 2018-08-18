const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);

const firebaseStore = new function () { // database
    // Initialize Cloud Firestore through Firebase
    const db = firebase.firestore();

    const createUser = (user) => {
        const data = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date().getTime(),
            signAt: new Date().getTime(),
        };

        db.collection("users").doc(user.uid).set(data)
            .then(function () {
                console.log("Document successfully written!");
            })
            .catch(function (error) {
                console.error("Error writing document: ", error);
            });

    };

    this.signInUser = async (user) => {

        const userRef = db.collection("users").doc("user.uid");

        try {
            const doc = await userRef.get();

            if (doc.exists) {
                const data = {
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL,
                    signAt: new Date().getTime(),
                };

                userRef.update(data)
                    .then(function () {
                        console.log("Document successfully updated!");
                    })
                    .catch(function (error) {
                        // The document probably doesn't exist.
                        console.error("Error updating document: ", error);
                    });
            } else {
                createUser(user);
            }
        } catch (error) {
            console.log("Error getting document:", error);
        }

    };

    this.readUser = () => {

    };


};

const firebaseStorage = new function () {

};

/**
 * firebase 관련 API 기능을 담은 객체
 */
const firebaseApi = new function () {

    const provider = new firebase.auth.GoogleAuthProvider();

    /**
     * @parameter : user
     */
    let signInListener = null;
    let signOutListener = null;

    this.setSignInListener = (callback) => {
        signInListener = callback;
    };
    this.setSignOutListener = (callback) => {
        signOutListener = callback;
    };


    this.signIn = async () => {

        try {
            const result = await firebase.auth().signInWithPopup(provider);

            const user = result.user;

            console.log('login');
            await firebaseStore.signInUser(user);

            if (signInListener !== null)
                signInListener(user);
        } catch (error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
        }


    };

    this.signOut = async () => {
        try {
            await firebase.auth().signOut();
            // Sign-out successful.
            if (signOutListener !== null)
                signOutListener();
        } catch (error) {
            // An error happened.
            console.log(error);
        }
    };


};