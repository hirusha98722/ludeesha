import PropTypes, { bool } from 'prop-types';
import React, { useMemo, useReducer, useCallback, useEffect } from 'react';
import axios, { endpoints } from '@/utils/axios';
import { AuthContext } from './auth-context';
import { Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';


interface StateType {
    user: any;
    loading: boolean;
    signup_state: any;
    submit_survay_state: any;
    bedtime_predicted_data:null,
    pushToken:null
}

interface UserType {
    _id: string;
    email: string;
    fullName: string;
    age: string;
    gender: string;
    height: string;
    weight: string;
    survay_completed: string;
    sleepingDisorder: string,
    sleepingDisorderNote: string,
    physicalDisability: string,
    physicalDisabilityNote: string,
    workEnvironmentImpact: string,
    stressLevel: string,
    wakeup_time:[],
    pushToken: null
}


type ActionType =
  | { type: 'INITIAL'; payload: { user: UserType | null; loading: boolean; signup_state: any | null; submit_survay_state:any; bedtime_predicted_data:any|null; pushToken:any|null; } }
  | { type: 'SIGNIN'; payload: { user: UserType } }
  | { type: 'SIGNOUT' }
  | { type: 'START_LOADING'; payload: { loading: boolean} }
  | { type: 'STOP_LOADING'; payload: { loading: boolean} }
  | { type: 'SIGN_UP'; payload: { signup_state: any} }
  | { type: 'SUBMIT_SURVAY'; payload: { submit_survay_state: any} }
  | { type: 'GET_BEDTIME_PREDICTED'; payload: { bedtime_predicted_data: any} }
  | { type: 'SET_PUSH_TOKEN'; payload: { pushToken: any} }
  

const initialState: StateType = {
    user: null,
    loading: false,
    signup_state:null,
    submit_survay_state: null,
    bedtime_predicted_data:null,
    pushToken: null
};

const reducer = (state: StateType, action: ActionType): StateType => {
    switch (action.type) {
        case 'INITIAL':
            return {
                loading: false,
                user: action.payload.user,
                signup_state: action.payload.signup_state,
                submit_survay_state: action.payload.submit_survay_state,
                bedtime_predicted_data: action.payload.bedtime_predicted_data,
                pushToken: action.payload.pushToken
            };
        case 'SIGNIN':
                return {
                    ...state,
                    user: action.payload.user,
                };
        case 'START_LOADING':
                return {
                    ...state,
                    loading: true,
                };
        case 'STOP_LOADING':
                return {
                    ...state,
                    loading: false,
                };
        case 'SIGN_UP':
            return {
                ...state,
                signup_state: action.payload.signup_state,
            };
        case 'SUBMIT_SURVAY':
            return {
                ...state,
                submit_survay_state: action.payload.submit_survay_state,
            };
        case 'GET_BEDTIME_PREDICTED':
            return {
                ...state,
                bedtime_predicted_data: action.payload.bedtime_predicted_data,
            };
        case 'SET_PUSH_TOKEN':
            return {
                ...state,
                pushToken: action.payload.pushToken,
            };
        case 'SIGNOUT':
            return {
                ...state,
                user: null,
            };
        
        default:
            return state;
    }
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, dispatch] = useReducer(reducer, initialState);

    const initialize = useCallback(async () => {
        
        
        dispatch({
            type:'START_LOADING',
            payload:{
                loading:true
            }
        })
        try {

            const localuser = await AsyncStorage.getItem('user');

            if(localuser !==null){
                const jsonUser = JSON.parse(localuser)

                const response = await axios.get(`${endpoints.auth.me}/${jsonUser._id}`)


                if (response && response.data) {

                    const authUser = JSON.stringify(response.data.user)

                    await AsyncStorage.setItem('user',authUser)

                    dispatch({
                        type: 'INITIAL',
                        payload: {
                            user:{
                                ...response.data.user
                            },
                            loading: false,
                            signup_state:null,
                            submit_survay_state:null,
                            bedtime_predicted_data:null,
                            pushToken:null,
                        },
                    });
                }
                else{
                    dispatch({
                        type: 'INITIAL',
                        payload: {
                            user:null,
                            loading: false,
                            signup_state:null,
                            submit_survay_state:null,
                            bedtime_predicted_data:null,
                            pushToken:null,
                        },
                    });
                }

            }

        } catch (error) {
            dispatch({
                type: 'INITIAL',
                payload: {
                    user:null,
                    loading: false,
                    signup_state:null,
                    submit_survay_state:null,
                    bedtime_predicted_data:null,
                    pushToken:null,
                },
            });
        }
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const sign_in = async (email: string, password: string) => {
        try {

            const response = await axios.post(endpoints.auth.sign_in, {
                email: email,
                password: password,
            });
        
            if (response.data.success) {
                
                const jsonValue = JSON.stringify(response.data.user);
                await AsyncStorage.setItem('user', jsonValue);

                dispatch({
                    type: 'SIGNIN',
                    payload: { 
                        user:{
                            ...response.data.user
                        }
                     },
                });
            }
        } catch (error) {
            Toast.show({type:'error',text1:'Login failed. Please try again.',position:'bottom', swipeable:true})
        }
    };

    const sign_up = useCallback(async (userObject: any) => {

        try{
            
            const response = await axios.post(endpoints.auth.sign_up, userObject);

            if (response.data.success) {
                
                const jsonValue = JSON.stringify(response.data.user);
                await AsyncStorage.setItem('user', jsonValue);

                dispatch({
                    type: 'SIGNIN',
                    payload: { 
                        user:{
                            ...response.data.user
                        }
                     },
                });

                dispatch({
                    type: 'SIGN_UP',
                    payload: {
                        signup_state: response.data
                    },
                });
            }
        }catch(error){
            
            Toast.show({type:'error',text1:'Sign Up failed. Please try again.',position:'bottom', swipeable:true})
        }
    
    }, []);

    const submitSurvay = useCallback(async (survayObject: any, _id: string) => {

        try{

            const formattedWakeupTime = Object.entries(survayObject.wakeup_time)
                .filter(([day, time]) => time) 
                .map(([day, time]) => ({ day, time }));

                const formattedSurvayObject = {
                ...survayObject,
                wakeup_time: formattedWakeupTime, 
                };

                console.log("Submitting Survey:", formattedSurvayObject);
        
            const response = await axios.post(`${endpoints.user.submit_survay}/${_id}`, formattedSurvayObject);

            await set_user(response.data.data)
            dispatch({
                type: 'SUBMIT_SURVAY',
                payload: {
                    submit_survay_state: response.data
                },
            });

            setTimeout(() => {
                dispatch({
                    type: 'SUBMIT_SURVAY',
                    payload: {
                        submit_survay_state: null
                    },
                });    
            }, 3000);
            
        }catch(error){
            
            Toast.show({type:'error',text1:'Failed to submit survay',position:'bottom', swipeable:true})
        }
    
    }, []);

    const submitPushToken = useCallback(async (token: string, _id: string) => {

        try{

            const data = {
                "token":token
            }

            const response = await axios.post(`${endpoints.user.submit_token}/${_id}`,data);

            const {expo_token, user} = response.data;


            dispatch({
                type: 'SET_PUSH_TOKEN',
                payload: {
                    pushToken: expo_token
                },
            });
            
            
        }catch(error){
            Toast.show({type:'error',text1:'Failed to submit expo token',position:'bottom', swipeable:true})
        }
    
    }, []);

    const sign_out = async() => {
        await AsyncStorage.clear()
        dispatch({
                    type: 'SIGN_UP',
                    payload: {
                        signup_state: null
                    },
                });
        dispatch({ type: 'SIGNOUT' });
    };

    const set_user = async (user:any) => {
        try {

            const jsonValue = JSON.stringify(user);
            await AsyncStorage.setItem('user', jsonValue);

            dispatch({
                type: 'SIGNIN',
                payload: { 
                    user:{
                        ...user
                    }
                 },
            });
            
        } catch (error) {
            Toast.show({type:'error',text1:'Failed to update restart',position:'bottom', swipeable:true})
        }
    };

    const get_bedtime_predict_data = async (_id:any,stepCount:any) => {
        try {


            const response = await axios.get(`${endpoints.user.predict_bedtime}/${_id}/${stepCount}`);

        
            if (response.data.success) {
                

                dispatch({
                    type: 'GET_BEDTIME_PREDICTED',
                    payload: { 
                        bedtime_predicted_data:response.data
                     },
                });
            }
        } catch (error) {
            console.log('================ffgd====================');
            console.log(error);
            console.log('====================================');
            Toast.show({type:'error',text1:'Failed to get bedtime data',position:'bottom', swipeable:true})
        }
    };
 

    const memoizedValue = useMemo(
        () => ({
            user: state.user,
            loading: state.loading,
            signup_state: state.signup_state,
            submit_survay_state: state.submit_survay_state,
            bedtime_predicted_data: state.bedtime_predicted_data,
            pushToken: state.pushToken,
            //
            sign_in,
            sign_out,
            sign_up,
            submitSurvay,
            get_bedtime_predict_data,
            submitPushToken,
            
        }),
        [
            state, 
            sign_in, 
            sign_out,
            sign_up,
            submitSurvay,
            get_bedtime_predict_data,
            submitPushToken,
        ]
    );

    return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
    children: PropTypes.node,
};
