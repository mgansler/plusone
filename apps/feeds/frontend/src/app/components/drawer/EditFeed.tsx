import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Select,
} from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import gql from 'graphql-tag'
import { ChangeEvent } from 'react'
import { useApolloClient, useMutation } from 'react-apollo'
import React from 'react'

import {
  AddFeedToGroup,
  AddFeedToGroupMutation,
  AddFeedToGroupMutationVariables,
  DeleteFeed,
  DeleteFeedMutation,
  FeedFieldsFragment,
  FeedsAndGroups,
  Group,
  MutationDeleteFeedArgs,
} from '@plusone/feeds-schema'
import { useBoolean } from '@plusone/hooks'

import { useFeedStyles } from './style'

type EditFeedProps = {
  feed: FeedFieldsFragment
}

export function EditFeed({ feed }: EditFeedProps) {
  const classNames = useFeedStyles()
  const [isOpen, open, close] = useBoolean(false)

  const [deleteFeed] = useMutation<DeleteFeedMutation, MutationDeleteFeedArgs>(
    DeleteFeed,
    {
      refetchQueries: [{ query: FeedsAndGroups }],
      variables: { feedId: feed.id },
    },
  )

  const [addToGroup] = useMutation<
    AddFeedToGroupMutation,
    AddFeedToGroupMutationVariables
  >(AddFeedToGroup, {
    refetchQueries: [{ query: FeedsAndGroups }],
  })

  const groupData = useApolloClient().readQuery<{
    groups: Pick<Group, 'id' | 'name'>[]
  }>({
    query: gql`
      query Groups {
        groups {
          id
          name
        }
      }
    `,
  })

  const handleSelectGroup = (event: ChangeEvent<{ value: unknown }>) => {
    addToGroup({
      variables: { feedId: feed.id, groupId: event.target.value as string },
    })
    close()
  }

  return (
    <React.Fragment>
      <IconButton className={classNames.drawerDelete} onClick={open}>
        <Edit />
      </IconButton>

      <Dialog open={isOpen} onClose={close}>
        <DialogTitle>{`Edit ${feed.title}`}</DialogTitle>

        <DialogContent>
          <Select
            value={feed.group?.id}
            fullWidth={true}
            onChange={handleSelectGroup}
          >
            {groupData?.groups.map((group) => (
              <MenuItem key={group.id} value={group.id}>
                {group.name}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => deleteFeed()} color={'secondary'}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  )
}
