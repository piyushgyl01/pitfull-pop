// user type definition
export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
  // optional
  posts?: Post[];
}

// post type definition
export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
  // optional
  comments?: Comment[];
}

// comment type definition
export interface Comment {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
}
