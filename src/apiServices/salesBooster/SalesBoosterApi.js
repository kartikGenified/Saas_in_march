import { baseApi } from "../baseApi";
import { slug } from "../../utils/Slug";

export const SalesBoosterApi = baseApi.injectEndpoints({
  endpoints: builder => ({
    checkSalesBooster: builder.mutation({
      query({token}) {
        console.log("tokensales booster", token)
        return {
          url: `/api/app/salesBooster/check`,
          method: 'get',
          headers: {
            "slug": slug,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          
        };
      },
    }),
    checkActiveSalesBoosterEachScan:builder.mutation({
      query({token}) {
        console.log("tokensales booster", token)
        return {
          url: `/api/app/salesBooster/eachScan`,
          method: 'get',
          headers: {
            "slug": slug,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          
        };
      },
    }),
  }),
});

export const {useCheckSalesBoosterMutation,useCheckActiveSalesBoosterEachScanMutation} = SalesBoosterApi;
