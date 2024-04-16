import { baseApi } from "../baseApi";
import { slug } from "../../utils/Slug";

export const CashbackRedeemApi = baseApi.injectEndpoints({
    endpoints:(builder) =>({
        redeemCashback: builder.mutation({
            query: (params) => {
              return {
                method: "POST",
                url: `/api/app/cashbackRedemptions/add`,
                headers: {
                  "Content-Type": "application/json",
                  slug: slug,
                  "Authorization": `Bearer ${params.token}`,
                },
                body:params.data
              };
            },
          }),
          addCashToBank: builder.mutation({

            query: (params) => {
              console.log("object",params.body);
              return {
                method: "POST",
                url: `/api/app/cashTranferToBank/add`,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + params.token,
                  slug: slug,
                },
                body:params.body
              };
            },
          }),
          
          getWalletBalance:builder.mutation({
            query: (params) => {
              console.log("object",params);
              return {
                method: "GET",
                url: `/api/app/userCashback?app_user_id=${params.appUserId}`,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + params.token,
                  slug: slug,
                },
                
              };
            },
          }),
          getCashTransactions: builder.mutation({

            query: (params) => {
              console.log("object",params);
              return {
                method: "GET",
                url: `/api/tenant/cash-transactions/app-user?app_user_id=${params.appUserId}&limit=100&offset=0`,
                headers: {
                  "Content-Type": "application/json",
                  Authorization: "Bearer " + params.token,
                  slug: slug,
                },
                
              };
            },
          }),
    }),
    
});


export const {useRedeemCashbackMutation,useAddCashToBankMutation,useGetCashTransactionsMutation,useGetWalletBalanceMutation} = CashbackRedeemApi

