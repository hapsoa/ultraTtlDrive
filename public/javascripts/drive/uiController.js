const loginManager = new function () {

    const $logInOutButton = $('.nav-profile-field');
    const $uploadButton = $('.browse-button');
    const $cardsZone = $('.card-part');

    /**
     * Login Logout Button
     */
    $logInOutButton.on('click', async function () {
        const $this = $(this);

        if ($this.attr('type') === 'logout') {
            // 로그아웃 상태 -> 로그인
            await firebaseApi.signIn();
        }
        else {
            // 로그인 상태 -> 로그아웃
            console.log('logout');
            await firebaseApi.signOut();
        }
    });

    /**
     * LogInOut Listener of firebaseApi
     */
    firebaseApi.setOnAuthStateChangedListener(async (user) => {
        if (user) {
            // 로그인 상태
            $logInOutButton.find('.nick-name-grid').text(user.displayName);
            $logInOutButton.find('.email-grid').text(user.email);

            $logInOutButton.find('.profile-photo-grid')
                .css('background-image', `url("${user.photoURL}")`);

            $logInOutButton.attr('type', 'login');

            $uploadButton.removeClass('display-none');

            dropboxManager.on();

            cardManager.updateCards(user);
            await friendsBarManager.setupUsers();
            friendsBarManager.activateRadioButton(user);

            leftSideBarManager.updateUser(user);
            leftSideBarManager.updateStorageState(user);
        } else {
            // 로그아웃 상태
            $logInOutButton.attr('type', 'logout');
            $uploadButton.addClass('display-none');

            dropboxManager.off();

            cardManager.emptyCards();
            friendsBarManager.emptyFriends();
        }
    });


    /**
     * File upload button
     */
    $uploadButton.on('click', function () {
        $('input[type="file"]').trigger('click');
    });
    const $internalUploadButton = $('input[type="file"]');
    $internalUploadButton.on('click', function (e) {
        e.stopPropagation();
    });
    $internalUploadButton.on('change', function () {
        const currentUser = firebase.auth().currentUser;
        const selectedFiles = document.getElementById('hiddenUploadButton').files;

        _.forEach(selectedFiles, function (file) {
            // 파일들을 데이터베이스에 저장한다.
            // 파일들을 클라우드 저장소에 저장한다.
            firebaseApi.writeFile(currentUser, file);
            cardManager.cardList.push(new Card(file));
        });

    });

};


/**
 * Drag and Drop
 */
const dropboxManager = new function () {
    const dropbox = document.getElementById("dropbox");
    const $dropbox = $('#dropbox');

    this.on = () => {
        dropbox.addEventListener("dragenter", dragenter, false);
        dropbox.addEventListener("dragover", dragover, false);
        dropbox.addEventListener("drop", drop, false);
    };

    this.off = () => {
        dropbox.removeEventListener("dragenter", dragenter);
        dropbox.removeEventListener("dragover", dragover);
        dropbox.removeEventListener("drop", drop);
        // $dropbox.unbind();
        // console.log('yes unbind');
    };

    function dragenter(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function dragover(e) {
        e.stopPropagation();
        e.preventDefault();
    }

    function drop(e) {
        e.stopPropagation();
        e.preventDefault();

        const dt = e.dataTransfer;
        const files = dt.files;

        handleFiles(files);
    }

    function handleFiles(files) {
        const currentUser = firebase.auth().currentUser;
        // 저장소로 보낸다.
        _.forEach(files, function (file) {
            firebaseApi.writeFile(currentUser, file);

            cardManager.cardList.push(new Card(file));
        });
    }

};


/**
 * Card constructor
 */
const Card = function (file) {

    const $cardsZone = $('.card-part');

    this.fileName = file.name;

    const fileTypeData = convertScreenFileType(file.type);

    const iconColor = fileTypeData.iconColor;
    const cardImageIcon = fileTypeData.cardImageIcon;
    const screenFileType = fileTypeData.convertedFileType;
    const screenFileSize = convertProperByteUnit(file.size);

    const template = `<div class="card-cover-cell">
            <div class="sights-card-cell">
                <div class="sights-photo-div flex align-center ${iconColor}">
                    <div class="hover-dark-background"></div>
                    <div class="${cardImageIcon}"></div>
                </div>
                <div class="sights-content-div flex align-center">
                    <div class="content flex-1">
                        <div class="text bold">${file.name}</div>
                        <div class="text desc">${screenFileType} / ${screenFileSize}</div>
                    </div>
                    <div class="download-icon"><i class="fas fa-download"></i></div>
                </div>
                <div class="i fas fa-trash-alt"></div>
            </div>
        </div>`;

    const $template = $(template);

    // 삭제 기능
    const $trashIcon = $template.find('.i.fas.fa-trash-alt');
    $trashIcon.on('click', function () {
        const currentUser = firebase.auth().currentUser;

        $template.remove();

        // 데이터베이스와 저장소를 모두 삭제한다.
        firebaseApi.removeFile(currentUser, file);

    });

    // 다운로드 기능
    const $downloadIcon = $template.find('.download-icon');
    $downloadIcon.on('click', function () {
        const currentUser = firebase.auth().currentUser;

        console.log('download');
        firebaseStorage.downloadFile(currentUser, file);
    });

    $cardsZone.append($template);
    this.$template = $template;

    function convertScreenFileType(fileType) {
        let iconColor;
        let cardImageIcon;
        let convertedFileType;

        if (fileType !== "") {
            convertedFileType = file.type.split('/')[0].toUpperCase();
        } else {
            iconColor = "type-etc-color";
            cardImageIcon = "i fas fa-file";
            convertedFileType = "ETC";
        }

        if (convertedFileType === "IMAGE") {
            iconColor = "type-image-color";
            cardImageIcon = "i fas fa-image";
        } else if (convertedFileType === "AUDIO") {
            iconColor = "type-sound-color";
            cardImageIcon = "i fas fa-music";
        } else if (convertedFileType === "VIDEO") {
            iconColor = "type-video-color";
            cardImageIcon = "i fas fa-video";
        } else if (convertedFileType === "APPLICATION") {
            iconColor = "type-code-color";
            cardImageIcon = "i fas fa-code";
        } else if (convertedFileType === "TEXT") {
            iconColor = "type-text-color";
            cardImageIcon = "i fas fa-font";
        }

        return {
            iconColor: iconColor,
            cardImageIcon: cardImageIcon,
            convertedFileType: convertedFileType
        };
    }

    function convertProperByteUnit(bytes) {
        let convertedBytesAtScreen;

        if (bytes <= 1024) {
            convertedBytesAtScreen = bytes + 'B';
        } else if (bytes > 1024 && bytes <= Math.pow(1024, 2)) {
            convertedBytesAtScreen = (bytes / 1024).toFixed(1) + 'KB';
        } else if (bytes > Math.pow(1024, 2) && bytes <= Math.pow(1024, 3)) {
            convertedBytesAtScreen = (bytes / Math.pow(1024, 2)).toFixed(1) + 'MB';
        } else if (bytes > Math.pow(1024, 3)) {
            convertedBytesAtScreen = (bytes / Math.pow(1024, 3)).toFixed(1) + 'GB';
        }
        return convertedBytesAtScreen;
    }

};


const cardManager = new function () {

    this.cardList = [];

    this.updateCards = async function (user) {
        // 해당유저에 대한 정보를 가지고
        // 데이터베이스에 있는 정보를 보고,
        // 화면에 출력한다.
        this.emptyCards();

        try {
            const querySnapshot = await firebaseStore.readFilesOfTheUser(user);

            querySnapshot.forEach(function (doc) {
                cardManager.cardList.push(new Card(doc.data()));
            });
            console.log(cardManager.cardList);

        } catch (error) {
            console.log("Error getting documents: ", error);
        }
    };

    this.emptyCards = function () {
        $('.card-part').empty();
        this.cardList = [];
    }
};


/**
 * 친구창
 */
const friendsBarManager = new function () {
    const $friendsBox = $('.travellers-part');

    this.setupUsers = async function () {
        const querySnapshot = await firebaseStore.readAllUsers();

        querySnapshot.forEach(function (doc) {
            // console.log(doc.id, " => ", doc.data());

            new Friend(doc.data());
        });
    };

    const Friend = function (user) {

        const template = `<div class="travellers-cell flex align-center">
            <div class="photo-div">
                <img src="${user.photoURL}" alt="personal face">
            </div>
            <div class="travellers-name-div flex-1">${user.displayName}</div>
            <div class="radio-box flex align-center">
                <div class="circle"></div>
            </div>
            <div class="uid">${user.uid}</div>
        </div>`;

        $friendsBox.append(template);
    };

    this.activateRadioButton = (user) => {
        const $friends = $('.travellers-cell');

        $friends.each(function () {
            const $this = $(this);

            if ($this.find('.travellers-name-div').text() === user.displayName) {
                $this.attr('check', 'on');
            }
        });

        $friends.on('click', async function () {
            const $this = $(this);
            $this.find('.radio-box').addClass('.animation-bounce-in');

            const $part = $('.travellers-part');
            if ($this.attr('check') !== 'on') {
                // 다른 유저 클릭 시
                $part.find($friends).attr('check', '');
                $this.attr('check', 'on');

                const selectedUser = await firebaseStore.readUserByUid(
                    $this.find('.uid').text());

                // 카드들을 해당 유저 카드로 업데이트한다.
                cardManager.updateCards(selectedUser);
                // 왼쪽바 정보들을 해당 유저 정보로 업데이트한다.
                leftSideBarManager.updateUser(selectedUser);
                leftSideBarManager.updateStorageState(selectedUser);

                const currentUser = firebase.auth().currentUser;
                const $uploadButton = $('.browse-button');
                if (currentUser.uid === selectedUser.uid) {
                    dropboxManager.on();
                    $uploadButton.removeClass('display-none');
                }
                else {
                    dropboxManager.off();
                    $uploadButton.addClass('display-none');
                }
            }

        });
    };

    this.emptyFriends = () => $friendsBox.empty();


};


/**
 * 왼쪽 옵션 창
 */
const leftSideBarManager = new function () {
    this.updateUser = (user) => {
        const $leftSideBar = $('.left-side-bar');

        $leftSideBar.find('.profile-photo')
            .css('background-image', `url("${user.photoURL}")`);

        $leftSideBar.find('.nick-name')
            .text(user.displayName);

        $leftSideBar.find('.email')
            .text(user.email);
    };

    const $storageState = $('.storage-grid');
    const $storageStateCategories = $storageState.find('.category');
    // const totalCapacity = 10 * Math.pow(1024, 3); // 10GB
    const totalCapacity = 100 * Math.pow(1024, 1);
    this.updateStorageState = async (user) => {
        // % 들을 update 한다.
        let imagePercent = 0;
        let applicationPercent = 0;
        let textPercent = 0;
        let audioPercent = 0;
        let videoPercent = 0;
        let etcPercent = 0;

        const files = await firebaseStore.readFilesOfTheUser(user);

        // typeString 과 데이터베이스의 files 의 type를 비교한다.
        files.forEach((function(doc) {

            const fileData = doc.data();

            $storageStateCategories.each(function() {
                const $this = $(this);

                const typeString = $this.find('.text').clone()    //clone the element
                    .children() //select all the children
                    .remove()   //remove all the children
                    .end()  //again go back to selected element
                    .text()
                    .toLowerCase();

                if (fileData.type.split('/')[0] === typeString) {

                    switch(typeString) {
                        case 'image':
                            imagePercent += fileData.size;
                            break;
                        case 'application':
                            applicationPercent += fileData.size;
                            break;
                        case 'text':
                            textPercent += fileData.size;
                            break;
                        case 'audio':
                            audioPercent += fileData.size;
                            break;
                        case 'video':
                            videoPercent += fileData.size;
                            break;
                    }
                }

                if (fileData.type === "" && typeString === 'etc') {
                    etcPercent += fileData.size;
                }

            });
        }));

        imagePercent = toPercent(imagePercent, totalCapacity);
        applicationPercent = toPercent(imagePercent, totalCapacity);
        textPercent = toPercent(imagePercent, totalCapacity);
        audioPercent = toPercent(imagePercent, totalCapacity);
        videoPercent = toPercent(imagePercent, totalCapacity);
        etcPercent = toPercent(imagePercent, totalCapacity);

        console.log(imagePercent, applicationPercent, textPercent,
            audioPercent, videoPercent, etcPercent);

    };

    function toPercent(sectionValue, totalValue) {
        return (sectionValue / totalValue * 100).toFixed(1);
    }
};


/**
 * 검색 기능
 */
const searchManager = new function () {
    const $searchInput = $('#search');

    $searchInput.on('keyup', function () {
        const $this = $(this);

        const inputValue = $this.val();

        _.forEach(cardManager.cardList, function (card) {
            console.log(card.fileName);
            if (card.fileName.indexOf(inputValue) !== -1) {
                card.$template.removeClass('display-none');
            } else {
                card.$template.addClass('display-none');
            }
        });
    })
};















