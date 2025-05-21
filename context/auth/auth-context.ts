import { createContext } from 'react';


export interface AuthContextType {
  user?: any;  
  loading?: boolean;
  signup_state?:any;
  sign_in?: (email: string, password: string) => Promise<void>;
  sign_out?: () => void;
  sign_up?: (userObject: any) => Promise<void>;
  submit_survay_state:  any;
  submitSurvay?:(survayObject: any, _id:string) => Promise<void>;
  get_bedtime_predict_data?: (_id: string, stepCount:any) => Promise<void>;
  bedtime_predicted_data:any,
  submitPushToken?:(token: any, _id:string) => Promise<void>;
  
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
