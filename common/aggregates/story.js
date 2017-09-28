import Immutable from 'seamless-immutable'

import events from '../events'
import { Event } from '../helpers'
import throwIfAggregateAlreadyExists from './validators/throwIfAggregateAlreadyExists'
import throwIfAggregateIsNotExists from './validators/throwIfAggregateIsNotExists'

const { STORY_CREATED, STORY_UPVOTED, STORY_UNVOTED, COMMENT_CREATED } = events

export default {
  name: 'stories',
  initialState: Immutable({}),
  commands: {
    createStory: (state: any, command) => {
      const { title, link, userId, text } = command.payload

      throwIfAggregateAlreadyExists(state, command)

      if (!userId) {
        throw new Error('UserId is required')
      }

      if (!title) {
        throw new Error('Title is required')
      }

      return new Event(STORY_CREATED, {
        title,
        text,
        link,
        userId
      })
    },

    upvoteStory: (state: any, command) => {
      const { userId } = command.payload

      throwIfAggregateIsNotExists(state, command)

      if (!userId) {
        throw new Error('UserId is required')
      }

      if (state.voted.includes(userId)) {
        throw new Error('User already voted')
      }

      return new Event(STORY_UPVOTED, {
        userId
      })
    },

    unvoteStory: (state: any, command) => {
      const { userId } = command.payload

      throwIfAggregateIsNotExists(state, command)

      if (!userId) {
        throw new Error('UserId is required')
      }

      if (!state.voted.includes(userId)) {
        throw new Error('User has not voted')
      }

      return new Event(STORY_UNVOTED, {
        userId
      })
    },

    createComment: (state: any, command) => {
      throwIfAggregateIsNotExists(state, command)

      const { commentId, parentId, userId, text } = command.payload

      if (!userId) {
        throw new Error('UserId is required')
      }

      if (!parentId) {
        throw new Error('ParentId is required')
      }

      if (!text) {
        throw new Error('Text is required')
      }

      return new Event(COMMENT_CREATED, {
        commentId,
        parentId,
        userId,
        text
      })
    }
  },
  projection: {
    [STORY_CREATED]: (state, { timestamp, payload: { userId } }) =>
      state.merge({
        createdAt: timestamp,
        createdBy: userId,
        voted: [],
        comments: {}
      }),

    [STORY_UPVOTED]: (state, { payload: { userId } }) =>
      state.update('voted', voted => voted.concat(userId)),

    [STORY_UNVOTED]: (state, { payload: { userId } }) =>
      state.update('voted', voted =>
        voted.filter(curUserId => curUserId !== userId)
      ),
    [COMMENT_CREATED]: (state, { timestamp, payload: { commentId, userId } }) =>
      state.setIn(['comments', commentId], {
        createdAt: timestamp,
        createdBy: userId
      })
  }
}