import { Devvit, useState } from '@devvit/public-api';
// import Phaser from 'phaser';

// Configure Devvit's plugins
Devvit.configure({
  redditAPI: true,
  redis: true,
});

async function daily_job(context:Devvit.Context, postId: string) {
  const shapeTypes = ['square', 'rectangle', 'rhombus', 'trapezoid', 'triangle', 'rightTriangle', 'circle'];
  const shapes = [];
  const shapeGroups: { [key: string]: { count: number } } = {};
  const postIdshape = postId + 'shapes';
  
  // 2. Generate random shapes
  const numShapes = Math.floor(Math.random() * (16 - 9 + 1)) + 9;
  for (let i = 0; i < numShapes; i++) {
      const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
      const size = Math.floor(Math.random() * (50 - 30 + 1)) + 30;
      shapes.push({ type, size });
      
      if (!shapeGroups[type]) {
          shapeGroups[type] = { count: 0 };
      }
      shapeGroups[type].count++;
  }
  
  await context.redis.hSet(postIdshape, {
    shapes: JSON.stringify(shapes),
    shapeGroups: JSON.stringify(shapeGroups),
  });

  // Get the groceryList record
  // const record = await context.redis.hGetAll(postIdshape);
  // const shapesR = JSON.parse(record.shapes);
  // console.log('Shapes:', shapesR);
  // console.log('Shape Groups:', record.shapeGroups);
}

// Add a scheduler job to generate a post daily
Devvit.addSchedulerJob({
  name: 'daily_thread',
  onRun: async (_, context) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const title = `Daily Job - ${today}`;
    const subreddit = await context.reddit.getCurrentSubreddit();
    const resp = await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: title,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    const currentPostId = context.postId;
    console.log(`The current post ID is: ${currentPostId}`);
    console.log('daily_thread handler called');
  },
});

// Generate a post on demand
Devvit.addMenuItem({
  label: 'Generate Post',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const title = `Daily Job - ${today}`;
    const subreddit = await context.reddit.getCurrentSubreddit();
    const resp = await context.reddit.submitPost({
      subredditName: subreddit.name,
      title: title,
      preview: (
        <vstack height="100%" width="100%" alignment="middle center">
          <text size="large">Loading ...</text>
        </vstack>
      ),
    });
    const currentPostId = resp.id;
    daily_job(context, currentPostId);
    context.ui.showToast("New job has been generated!");
  }
});

// Schedule the daily post generation
Devvit.addMenuItem({
  label: 'Daily Posts',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (event, context) => {
    const jobId = await context.scheduler.runJob({
      name: 'daily_thread',
      cron: '0 1 * * *',
    });
    await context.redis.set('daily_thread:jobId', jobId);
    context.ui.showToast('Scheduled daily_thread job');
    console.log('Scheduled daily_thread job with id:', jobId);
  },
});

// Terminate the daily post generation
Devvit.addMenuItem({
  label: 'Pause Daily Posts',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const jobId = (await context.redis.get('daily_thread:jobId')) || '0';
    await context.scheduler.cancelJob(jobId);
    context.ui.showToast('Cancelled daily_thread job');
    console.log('Cancelled daily_thread job with id:', jobId);
  },
});


// SOS function counsel all jobs
Devvit.addMenuItem({
  label: 'Cancel All Scheduled Jobs',
  location: 'subreddit',
  forUserType: 'moderator',
  onPress: async (_, context) => {
    const scheduledJobs = await context.scheduler.listJobs();
    for (const job of scheduledJobs) {
      await context.scheduler.cancelJob(job.id);
    }
    context.ui.showToast(`Cancelled ${scheduledJobs.length} scheduled jobs`);
    console.log(`Cancelled ${scheduledJobs.length} scheduled jobs`);
  },
});