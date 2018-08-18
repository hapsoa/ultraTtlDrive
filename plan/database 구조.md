users : {
	uid:
	id:
	name:
}

files {
	"filename":
	"size":
	"확장자":
	"업로드 날짜":
	"최종 수정일":
	"업로더"
}



users {
	uid: user.uid,
	displayName: user.displayName,
	email: user.email,
	photoURL: user.photoURL,
	createdAt: new Date().getTime(),
	signAt: new Date().getTime()
}

files {
	name: file.name,
	size: file.size,
	type: file.type,
	uploader: currentUser.uid,
	lastModified: file.lastModified,
	lastModifiedDate: file.lastModifiedDate
}