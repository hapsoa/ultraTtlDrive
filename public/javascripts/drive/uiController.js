const uiController = new function() {

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
        } else {
            // 로그아웃 상태
            $logInOutButton.attr('type', 'logout');
            $uploadButton.addClass('display-none');
        }
    });

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
        });
    }

};

