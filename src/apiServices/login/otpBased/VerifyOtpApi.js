import { baseApi } from "../../baseApi";
import { slug } from "../../../utils/Slug";

export const VerifyOtpApi = baseApi.injectEndpoints({
    endpoints:(builder) =>({
        verifyOtp : builder.mutation({
            query({mobile,name,user_type_id,user_type,otp,is_approved_needed,fcm_token}){
                return {
                    url:`/api/app/userOtp/add`,
                    method:'post',
                    headers:{
                        "slug":slug,
                        "Content-Type": "application/json"
                    },
                    body:{
                        "mobile" : mobile,
                        "name":name,
                        "otp" : otp,
                        "user_type_id" : user_type_id,
                        "user_type" : user_type,
                        "is_approved_needed" : is_approved_needed,
                        "fcm_token":fcm_token
                    }
                    
                   
                }
            }
        })
    })
});


export const {useVerifyOtpMutation} = VerifyOtpApi

