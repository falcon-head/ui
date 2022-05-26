// Libraries
import {Dispatch} from 'redux'
import {push, RouterAction} from 'connected-react-router'
import {normalize} from 'normalizr'
import {cloneDeep} from 'lodash'

// APIs
import {getErrorMessage} from 'src/utils/api'
import * as api from 'src/client'
import {getOrg as getNewAPIData} from 'src/client/unityRoutes'

// Actions
import {notify} from 'src/shared/actions/notifications'
import {
  Action,
  setOrgs,
  addOrg,
  removeOrg,
  editOrg,
} from 'src/organizations/actions/creators'

import {
  orgCreateSuccess,
  orgCreateFailed,
  bucketCreateSuccess,
  bucketCreateFailed,
  orgEditSuccess,
  orgEditFailed,
  orgRenameSuccess,
  orgRenameFailed,
} from 'src/shared/copy/notifications'

import {gaEvent} from 'src/cloud/utils/reporting'

import {getOrg} from 'src/organizations/selectors'

// Schemas
import {orgSchema, arrayOfOrgs} from 'src/schemas'

// Types
import {
  Organization,
  RemoteDataState,
  NotificationAction,
  Bucket,
  AppThunk,
  OrgEntities,
  GetState,
} from 'src/types'

export const getOrganizations = () => async (
  dispatch: Dispatch<Action>,
  getState: GetState
): Promise<Organization[]> => {
  try {
    dispatch(setOrgs(RemoteDataState.Loading))

    const resp = await api.getOrgs({})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const {orgs} = resp.data

    if (orgs.length > 1) {
      throw new Error('Received more than one organization for this account.')
    }

    if (orgs.length > 0) {
      const newOrgAPIData = await getNewAPIData({orgId: orgs[0].id})

      if (newOrgAPIData.status !== 200) {
        throw new Error(newOrgAPIData.data.message)
      }

      const orgsWithProvider = [
        {...cloneDeep(orgs[0]), provider: newOrgAPIData.data.provider},
      ]

      const organizations = normalize<Organization, OrgEntities, string[]>(
        orgsWithProvider,
        arrayOfOrgs
      )

      gaEvent('cloudAppOrgIdReady', {
        identity: {
          organizationIds: organizations.result,
        },
      })

      dispatch(setOrgs(RemoteDataState.Done, organizations))

      return orgsWithProvider
    } else {
      const organizations = normalize<Organization, OrgEntities, string[]>(
        orgs,
        arrayOfOrgs
      )

      gaEvent('cloudAppOrgIdReady', {
        identity: {
          organizationIds: organizations.result,
        },
      })

      dispatch(setOrgs(RemoteDataState.Done, organizations))

      return orgs
    }
  } catch (error) {
    console.error(error)
    if (getOrg(getState())?.id && error.message === 'organization not found') {
      // if we have an org in state but the API says it's not found, remove it from state
      dispatch(removeOrg(getOrg(getState()).id))
    }
    dispatch(setOrgs(RemoteDataState.Error, null))
  }
}

export const createOrgWithBucket = (
  org: Organization,
  bucket: Bucket
): AppThunk<Promise<void>> => async (
  dispatch: Dispatch<Action | RouterAction | NotificationAction>
) => {
  let createdOrg: Organization

  try {
    const orgResp = await api.postOrg({data: org})
    if (orgResp.status !== 201) {
      throw new Error(orgResp.data.message)
    }

    createdOrg = orgResp.data

    dispatch(notify(orgCreateSuccess()))

    const normOrg = normalize<Organization, OrgEntities, string>(
      createdOrg,
      orgSchema
    )

    dispatch(addOrg(normOrg))
    dispatch(push(`/orgs/${createdOrg.id}`))

    const bucketResp = await api.postBucket({
      data: {...bucket, orgID: createdOrg.id},
    })

    if (bucketResp.status !== 201) {
      throw new Error(bucketResp.data.message)
    }

    dispatch(notify(bucketCreateSuccess()))
  } catch (error) {
    console.error(error)

    if (!createdOrg) {
      dispatch(notify(orgCreateFailed()))
    }
    const message = getErrorMessage(error)
    dispatch(notify(bucketCreateFailed(message)))
  }
}

export const createOrg = (org: Organization) => async (
  dispatch: Dispatch<Action | RouterAction | NotificationAction>
): Promise<void> => {
  try {
    const resp = await api.postOrg({data: org})

    if (resp.status !== 201) {
      throw new Error(resp.data.message)
    }

    const createdOrg = resp.data
    const normOrg = normalize<Organization, OrgEntities, string>(
      createdOrg,
      orgSchema
    )

    dispatch(addOrg(normOrg))
    dispatch(push(`/orgs/${createdOrg.id}`))

    dispatch(notify(orgCreateSuccess()))
  } catch (e) {
    console.error(e)
    dispatch(notify(orgCreateFailed()))
  }
}

export const deleteOrg = (org: Organization) => async (
  dispatch: Dispatch<Action>
): Promise<void> => {
  try {
    const resp = await api.deleteOrg({orgID: org.id})

    if (resp.status !== 204) {
      throw new Error(resp.data.message)
    }

    dispatch(removeOrg(org.id))
  } catch (e) {
    console.error(e)
  }
}

export const updateOrg = (org: Organization) => async (
  dispatch: Dispatch<Action | NotificationAction>
) => {
  try {
    const resp = await api.patchOrg({orgID: org.id, data: org})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const updatedOrg = resp.data
    const normOrg = normalize<Organization, OrgEntities, string>(
      updatedOrg,
      orgSchema
    )

    dispatch(editOrg(normOrg))

    dispatch(notify(orgEditSuccess()))
  } catch (error) {
    dispatch(notify(orgEditFailed()))
    console.error(error)
  }
}

export const renameOrg = (
  originalName: string,
  org: Organization
): AppThunk<Promise<void>> => async (
  dispatch: Dispatch<Action | NotificationAction>
) => {
  try {
    const resp = await api.patchOrg({orgID: org.id, data: org})

    if (resp.status !== 200) {
      throw new Error(resp.data.message)
    }

    const updatedOrg = resp.data

    const normOrg = normalize<Organization, OrgEntities, string>(
      updatedOrg,
      orgSchema
    )

    dispatch(editOrg(normOrg))
    dispatch(notify(orgRenameSuccess(updatedOrg.name)))
  } catch (error) {
    dispatch(notify(orgRenameFailed(originalName)))
    console.error(error)
  }
}
