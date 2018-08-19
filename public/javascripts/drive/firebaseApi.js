const firestore = firebase.firestore();
const settings = {/* your settings... */ timestampsInSnapshots: true};
firestore.settings(settings);


/**
 * Database
 */
const firebaseStore = new function () { // database
    // Initialize Cloud Firestore through Firebase
    const db = firebase.firestore();

    let writeFileMetaDataListener = null;

    this.setWriteFileMetaDataListener = (callback) => {
        writeFileMetaDataListener = callback;
    };

    const createUser = (user) => {
        const data = {
            uid: user.uid,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date().getTime(),
            signAt: new Date().getTime()
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

    this.writeFileMetaData = (file) => {
        const currentUser = firebase.auth().currentUser;
        const filesRef = db.collection("files");

        // 파일이름 중복 체크
        const query = filesRef.where("name", "==", file.name);

        query.get().then(function(doc) {
            if (doc.exists) {
                console.log("Document data:", doc.data());
            } else {
                // doc.data() will be undefined in this case
                console.log("No such document!");
            }
        }).catch(function(error) {
            console.log("Error getting document:", error);
        });

        db.collection("files").add({
            name: file.name,
            size: file.size,
            type: file.type,
            uploader: currentUser.uid,
            lastModified: file.lastModified,
            lastModifiedDate: file.lastModifiedDate
        })
            .then(function(docRef) {
                console.log("Document written with ID: ", docRef.id);
            })
            .catch(function(error) {
                console.error("Error adding document: ", error);
            });
    };

};


/**
 * Cloud storage
 */
const firebaseStorage = new function () {
    const storage = firebase.storage();
    const storageRef = storage.ref();

    this.writeFile = (file) => {
        // ref를 설정하고,
        let fileRef;

        if (file.type.indexOf("image") >= 0) {
            fileRef = storageRef.child(`images/${file.name}`);
        } else {
            fileRef = storageRef.child(`etc/${file.name}`);
        }

        // 저장을 한다.
        fileRef.put(file).then(function(snapshot) {
            console.log('Uploaded a blob or file!');
        });

    };
};


/**
 * firebase 관련 API 기능을 담은 객체
 */
const firebaseApi = new function () {

    const provider = new firebase.auth.GoogleAuthProvider();

    /**
     * Listener
     */
    let onAuthStateChangedListener = null;

    this.setOnAuthStateChangedListener = (callback) => {
        onAuthStateChangedListener = callback;
    };


    firebase.auth().onAuthStateChanged(async function(user) {
        if (user) {
            // User is signed in.
            var displayName = user.displayName;
            var email = user.email;
            var emailVerified = user.emailVerified;
            var photoURL = user.photoURL;
            var isAnonymous = user.isAnonymous;
            var uid = user.uid;
            var providerData = user.providerData;

            await firebaseStore.signInUser(user);
            onAuthStateChangedListener(user);
            console.log('login');
        } else {
            // User is signed out.

            onAuthStateChangedListener(null);
        }
    });


    this.signIn = async () => {

        try {
            await firebase.auth().signInWithPopup(provider);
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
            // Sign-out successful.
            await firebase.auth().signOut();
        } catch (error) {
            // An error happened.
            console.log(error);
        }
    };

    this.writeFile = (file) => {
        firebaseStore.writeFileMetaData(file);
        firebaseStorage.writeFile(file);
    };


};