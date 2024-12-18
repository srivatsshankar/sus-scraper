import { Devvit, useState } from '@devvit/public-api';
import './scheduler.js';

// Defines the messages that are exchanged between Devvit and Web View
type WebViewMessage =
  | {
      type: 'initialData';
      data: {
        shapes: { type: string; size: number }[];
        shapeGroups: { [key: string]: { count: number } };
      };
    }
  | {
      type: 'userData';
      data: {
        username: string;
        score: number;
        highScore: boolean;
      };
    }
  | {
      type: 'userScore';
      data: {
        score: number;
      };
    }
  | {
      type: 'leaderboard';
      data: {
        leaderboard: { member: string; score: number };
      };
  };

Devvit.configure({
  redditAPI: true,
  redis: true,
});

async function userScoreVerify(context:Devvit.Context, username: string, score: number) {
  const postId = 'leaderboard';
  const exists = await context.redis.zScore(postId, username);
  if (exists) {
    if (score > exists) {
      await context.redis.zAdd(
        postId,
        { member: username, score: score }
      );
    }
  } else {
    console.log('New high score:', score);
    await context.redis.zAdd(
      postId,
      { member: username, score: score }
    );
  }
}

async function leaderboardList(context:Devvit.Context) {
  const postId = 'leaderboard';
  
  // Fetch the last 5 members in descending order
  const totalMembers = await context.redis.zCard(postId);
  const leaderboard = await context.redis.zRange(postId, 0, 4, { by: 'rank' });

  // Reverse the array to get descending order
  return leaderboard.reverse();
}

async function highscoreVerify(context:Devvit.Context, score: number) {
  const postId = 'leaderboard';
  
  // Fetch the last 5 members in descending order
  const totalMembers = await context.redis.zCard(postId);
  const leaderboard = await context.redis.zRange(postId, 0, 10, { by: 'rank' });

  // Check if score is higher than any leaderboard entry or if leaderboard isn't full
  let highScore = false;
  if (leaderboard.length < 5) {
    highScore = true;
  } else {
    for (const entry of leaderboard) {
      if (score > entry.score) {
        highScore = true;
        break;
      }
    }
  }

  // Reverse the array to get descending order
  return highScore;
}

// Add a custom post type to Devvit
Devvit.addCustomPostType({
  name: 'Suspicious Skyscraper',
  height: 'tall',
  render: (context) => {

    // Load username with `useAsync` hook
    const [username] = useState(async () => {
      const currUser = await context.reddit.getCurrentUser();
      return currUser?.username ?? 'anon';
    });

    // Load latest counter from redis with `useAsync` hook
    const [shapes] = useState(async () => {
      const postId = context.postId;
      const postIdshape = postId + 'shapes';
      const shapes = await context.redis.hGetAll(postIdshape);
      return shapes.shapes;
    });

    const [shapeGroups] = useState(async () => {
      const postId = context.postId;
      const postIdshape = postId + 'shapes';
      const shapes = await context.redis.hGetAll(postIdshape);
      return shapes.shapeGroups;
    });
    
    const [webviewVisible, setWebviewVisible] = useState(true);

    const onMessage = async (msg: WebViewMessage) => {
      switch (msg.type) {
        case 'initialData':
          context.ui.webView.postMessage('myWebView', {
            type: 'initialData',
            data: {
              shapes: shapes,
              shapeGroups: shapeGroups,
            },
          });
          break;
        case 'userData':
          const highScore = await highscoreVerify(context, msg.data.score);
          context.ui.webView.postMessage('myWebView', {
            type: 'userData',
            data: {
              username: username,
              highScore: highScore,
            },
          });
          break;
        case 'userScore':
          userScoreVerify(context, username, msg.data.score);
          break;
        case 'leaderboard':
          const leaderboard = await leaderboardList(context);
          context.ui.webView.postMessage('myWebView', {
            type: 'leaderboard',
            data: {
              leaderboard: leaderboard,
            },
          });
          break;
        };
    };

    return (
      <vstack grow padding="small">
        <vstack grow={webviewVisible} height={webviewVisible ? '100%' : '0%'}>
          <vstack border="thick" borderColor="black" height={webviewVisible ? '100%' : '0%'}>
            <webview
              id="myWebView"
              url="index.html"
              grow
              height={webviewVisible ? '100%' : '0%'}
              onMessage={(msg) => onMessage(msg as WebViewMessage)}
            />
          </vstack>
        </vstack>
      </vstack>
    );
  },
});

export default Devvit;
