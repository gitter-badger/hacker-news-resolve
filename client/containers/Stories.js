import React from 'react';
import { connect } from 'react-redux';
import queryString from 'query-string';

import Story from '../components/Story';
import Paginator from '../components/Paginator';
import getById from '../helpers/getById';

import {
  STORIES_ON_ONE_PAGE,
  getPageStories,
  hasNextStories
} from '../helpers/getPageStories';
import actions from '../actions/stories';
import '../styles/stories.css';

export const Stories = props => {
  let { page } = queryString.parse(props.location.search);
  let { stories } = props;

  if (props.location.pathname.includes('ask')) {
    stories = stories.filter(story => story.type === 'ask');
  } else if (props.location.pathname.includes('show')) {
    stories = stories.filter(story => story.type === 'show');
  } else if (props.location.pathname === '/') {
    // TODO sort flow stories in some special order
  }

  const hasNext = hasNextStories(stories, page);
  stories = getPageStories(stories, page);
  const firstStoryIndex = STORIES_ON_ONE_PAGE * (page ? page - 1 : 0);

  return (
    <div>
      <div className="stories">
        <ol className="stories__list" start={firstStoryIndex + 1}>
          {stories.map(story => {
            const { type } = story;

            const link =
              type === 'ask' ? `/storyDetails?id=${story.id}` : story.link;
            const title =
              type === 'ask' ? `Ask HN: ${story.title}` : story.title;

            const user = getById(props.users, story.userId);

            return (
              <li key={story.id} className="stories__item">
                <Story
                  id={story.id}
                  title={title}
                  link={link}
                  date={new Date(story.createDate)}
                  score={story.voted.length}
                  user={user}
                  commentCount={story.commentsCount}
                  voted={story.voted.includes(props.user.id)}
                  onUpvote={() => props.onUpvote(story.id, props.user.id)}
                  onUnvote={() => props.onUnvote(story.id, props.user.id)}
                  loggedIn={!!props.user.id}
                />
              </li>
            );
          })}
        </ol>
      </div>
      <Paginator page={page} hasNext={hasNext} location={props.location} />
    </div>
  );
};

export const mapStateToProps = ({ stories, users, comments, user }) => {
  return {
    stories,
    users,
    user,
    comments
  };
};

export const mapDispatchToProps = dispatch => {
  return {
    onUpvote(id, userId) {
      return dispatch(
        actions.upvoteStory(id, {
          userId
        })
      );
    },
    onUnvote(id, userId) {
      return dispatch(
        actions.unvoteStory(id, {
          userId
        })
      );
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Stories);
