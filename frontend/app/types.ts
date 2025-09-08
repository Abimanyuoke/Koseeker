export interface IProduct {
    id: number;
    uuid: string;
    name: string;
    price: number;
    mainCategory: string;
    subCategory: string;
    description: string;
    picture: string;
}

export interface IKos {
    discountEndDate: string | undefined;
    id: number;
    uuid: string;
    userId: number;
    name: string;
    address: string;
    pricePerMonth: number;
    discountPercent?: number;
    gender: string;
    kampus: string;
    kota: string;
    kalender: string;
    createdAt: string;
    updatedAt: string;
    images: IKosImage[];
    facilities: IKosFacility[];
    books?: IBook[];
    reviews?: IReview[];
    likes?: ILike[];
    owner?: {
        id: number;
        name: string;
        email: string;
        phone?: string;
        profile_picture?: string;
    };
}

export interface IKosImage {
    id: number;
    uuid: string;
    kosId: number;
    file: string;
    createdAt: string;
    updatedAt: string;
}

export interface IKosFacility {
    id: number;
    uuid: string;
    kosId: number;
    facility: string;
    createdAt: string;
    updatedAt: string;
}

export interface IBook {
    id: number;
    uuid: string;
    kosId: number;
    userId: number;
    payment: string;
    startDate: string;
    endDate: string;
    durationMonths: number;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface IReview {
    id: number;
    uuid: string;
    kosId: number;
    userId: number;
    comment: string;
    createdAt: string;
    updatedAt: string;
    user?: {
        id: number;
        name: string;
        profile_picture?: string;
    };
}

export interface ILike {
    id: number;
    uuid: string;
    kosId: number;
    userId: number;
    createdAt: string;
    updatedAt: string;
}

export interface IUser {
    id: number,
    uuid: string,
    name: string,
    email: string,
    password: string,
    profile_picture: string,
    role: string,
    alamat: string,
    telephone: string,
    createdAt: string,
    updatedAt: string
}

export interface IOrder {
    orderLists: any;
    id: number;
    uuid: string;
    customer: string;
    alamat: string;
    total_price: number;
    payment_method: string;
    status: string;
    size: string;
    createdAt: string;
    updatedAt: string;
    userId: number;
}

export interface IOrderList {
    id: number;
    uuid: string;
    quantity: number;
    note: string;
    createdAt: string;
    updatedAt: string;
    menuId?: number;
    orderId?: number;
}