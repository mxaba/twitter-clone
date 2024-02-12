export interface userPro {
    username: string,
    password: string,
    email: string,
    id: string
}

export interface params {
    userId: string,
    searchString: string
}

export interface tweets {
    tweet: string,
    tags: string,
    createdBy: string,
}
