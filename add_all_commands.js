const { App } = require('@slack/bolt');

// Bolt 앱 초기화
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// 모든 커맨드를 저장할 객체
const registeredCommands = {};

// 커맨드를 등록하고 추적하는 함수
function registerCommand(command, handler) {
  app.command(command, handler);
  registeredCommands[command] = handler;
}

// 커맨드 등록
registerCommand('/hello', async ({ command, ack, respond }) => {
  await ack();
  await respond(`Hello, <@${command.user_id}>!`);
});

registerCommand('/goodbye', async ({ command, ack, respond }) => {
  await ack();
  await respond(`Goodbye, <@${command.user_id}>!`);
});

// 모든 커맨드 리스트를 로그로 출력
app.command('/list-commands', async ({ command, ack, respond }) => {
  await ack();
  const commandList = Object.keys(registeredCommands).join(', ');
  await respond(`Registered commands: ${commandList}`);
});

// 앱 실행
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Bolt app is running!');
})();
