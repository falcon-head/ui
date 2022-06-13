// Functions calling API
import {
  getMe,
  getIdentity,
  getAccount,
  Me,
  Identity,
  Account,
  Organization,
  getOrg,
} from 'src/client/unityRoutes'

// Feature Flag Check
import {isFlagEnabled} from 'src/shared/utils/featureFlag'

// Constants
import {CLOUD} from 'src/shared/constants'

import {CurrentIdentity} from '../reducers'

// Retrieve the user's quartz identity, using /quartz/identity if the 'quartzIdentity' flag is enabled.
export const retrieveQuartzIdentity = () =>
  CLOUD && isFlagEnabled('quartzIdentity') ? getIdentity({}) : getMe({})

// API LAYER SHOULDNT KNOW ABOUT THUNKS OR REDUX
//

// THIS DECISION - MAKING SHOULD BE MADE IN THE THUNK, NOT IN API LAYER
// relevant information is what should be sent back
// e.g., # of failures or retries, error message, etc.

// Populate the user's quartz identity in state, using /quartz/identity if the 'quartzIdentity' flag is enabled.

// Transitional function that translates quartzIdentity state into quartzMe state.

export enum IdentityError {
  Unauthorized = 'Not authorized to access this user. Please log in again or update your credentials.',
  InternalServer = 'Our servers encountered an unexpected error. Please try again later.',
  Unknown = 'Received an error of unknown type. Please report this information to InfluxDB',
}

export const retrieveIdentity = async (): Promise<Identity> => {
  // Returns 200, 401, or 500.
  const quartzIdentity = await getIdentity({})

  if (quartzIdentity.status === 200) {
    return quartzIdentity.data
  } else if (quartzIdentity.status === 401) {
    throw new Error(IdentityError.Unauthorized)
  } else if (quartzIdentity.status === 500) {
    throw new Error(IdentityError.InternalServer)
  } else {
    throw new Error(IdentityError.Unknown)
  }
}

export const retrieveAccountDetails = async (
  accountId: string | number
): Promise<Account> => {
  const accountIdString = accountId.toString()

  // Returns 200, 401, or 500.
  const accountDetails = await getAccount({
    accountId: accountIdString,
  })

  if (accountDetails.status === 200) {
    return accountDetails.data
  } else if (accountDetails.status === 401) {
    throw new Error(IdentityError.Unauthorized)
  } else if (accountDetails.status === 500) {
    throw new Error(IdentityError.InternalServer)
  } else {
    throw new Error(IdentityError.Unknown)
  }
}

export const retrieveOrgDetails = async (
  orgId: string
): Promise<Organization> => {
  // returns 200, 401, or 500

  const orgDetails = await getOrg({orgId})

  if (orgDetails.status === 200) {
    return orgDetails.data
  } else if (orgDetails.status === 401) {
    throw new Error(IdentityError.Unauthorized)
  } else if (orgDetails.status === 500) {
    throw new Error(IdentityError.InternalServer)
  } else {
    throw new Error(IdentityError.Unknown)
  }
}

export const convertIdentityToMe = (quartzIdentity: CurrentIdentity): Me => {
  const {account, org, user} = quartzIdentity

  return {
    // User Data
    email: user.email,
    id: user.id,
    // Careful about this line.
    isOperator: user.operatorRole ? true : false,
    operatorRole: user.operatorRole,

    // Account Data
    accountCreatedAt: account.accountCreatedAt,
    accountType: account.type,
    paygCreditStartDate: account.paygCreditStartDate,
    billingProvider: account.billingProvider ? account.billingProvider : null,

    // Organization Data
    clusterHost: org.clusterHost,
    regionCode: org.regionCode ? org.regionCode : null,
    isRegionBeta: org.isRegionBeta ? org.isRegionBeta : null,
    regionName: org.regionName ? org.regionName : null,
  }
}