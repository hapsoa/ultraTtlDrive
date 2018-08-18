const uiController = new function() {

    const $logInOutButton = $('.nav-profile-field');
    const $uploadButton = $('.browse-button');

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
    firebaseApi.setSignInListener((user) => {
        // 로그인 상태로 화면을 전환해준다.
        const $profileField = $('.nav-profile-field');

        $profileField.find('.nick-name-grid').text(user.displayName);
        $profileField.find('.email-grid').text(user.email);

        $logInOutButton.attr('type', 'login');
        $uploadButton.removeClass('display-none');
    });

    firebaseApi.setSignOutListener(() => {
        $logInOutButton.attr('type', 'logout');
        $uploadButton.addClass('display-none');
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
    $internalUploadButton.on('change', function(e) {

    });

};

