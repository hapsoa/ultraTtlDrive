const uiController = new function() {

    const $logInOutButton = $('.nav-profile-field');

    /**
     * Login Logout Button
     */
    $logInOutButton.on('click', function() {

        const $this = $(this);

        if ($this.attr('type') === 'logout') {
            // 로그아웃 상태 -> 로그인
            firebaseApi.signIn();

            // 로그인 상태로 화면을 전환해준다.
            $logInOutButton.attr('type', 'login');

            const $profileField = $('.nav-profile-field');

            $profileField.find('.nick-name-grid').text("heo");
            $profileField.find('.email-grid').text("hapsoa");


        }
        else {
            // 로그인 상태 -> 로그아웃
            console.log('logout');

            firebaseApi.signOut();

            $logInOutButton.attr('type', 'logout');
        }
    });
    /**
     * LogInOut Listener of firebaseApi
     */




};

firebaseApi.setSignInListener