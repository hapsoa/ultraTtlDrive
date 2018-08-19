const loginManager = new function() {

    const $logInOutButton = $('.nav-profile-field');
    const $uploadButton = $('.browse-button');
    const $cardsZone = $('.card-part');

    /**
     * Login Logout Button
     */
    $logInOutButton.on('click', async function() {
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
    firebaseApi.setOnAuthStateChangedListener((user) => {
        if (user) {
            // 로그인 상태
            $logInOutButton.find('.nick-name-grid').text(user.displayName);
            $logInOutButton.find('.email-grid').text(user.email);

            $logInOutButton.attr('type', 'login');
            $uploadButton.removeClass('display-none');

            updateCards();
        } else {
            // 로그아웃 상태
            $logInOutButton.attr('type', 'logout');
            $uploadButton.addClass('display-none');
        }
    });

    function updateCards(user) {
        // 해당유저에 대한 정보를 가지고
        firebaseStore

        // 데이터베이스에 있는 정보를 보고,
        // 화면에 출력한다.
    }


    /**
     * File upload button
     */
    $uploadButton.on('click', function() {
        $('input[type="file"]').trigger('click');
    });
    const $internalUploadButton = $('input[type="file"]');
    $internalUploadButton.on('click', function(e) {
        e.stopPropagation();
    });
    $internalUploadButton.on('change', function() {
        const selectedFiles = document.getElementById('hiddenUploadButton').files;

        _.forEach(selectedFiles, function(file) {
            console.log(file);
            // 파일들을 데이터베이스에 저장한다.
            // 파일들을 클라우드 저장소에 저장한다.
            firebaseApi.writeFile(file);
        });

    });

};


/**
 * Drag and Drop
 */
const dropboxManager = new function () {
    const dropbox = document.getElementById("dropbox");
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);

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
        // 저장소로 보낸다.
        _.forEach(files, function(file) {
            firebaseApi.writeFile(file);

            new Card(file);
        });
    }

};


/**
 * Card constructor
 */
const Card = function(file) {

    const $cardsZone = $('.card-part');

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

    $cardsZone.append(template);


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

        return { iconColor: iconColor,
                cardImageIcon: cardImageIcon,
                convertedFileType: convertedFileType };
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


const leftSideBarManager = new function() {

    this.updateUser = function() {

    };

};






















