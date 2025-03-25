export interface Task {
    id: number;
    title: string;
    description: string;
    status: string;
    assignee: string;
    createdAt: string;
    orderId?: number;
    comments?: Comment[];
  }
  
  export interface Comment {
    id: number;
    text: string;
    author: string;
    createdAt: string;
  }
  
  export interface DecodedToken {
    employeeId: number;
    role: string;
  }