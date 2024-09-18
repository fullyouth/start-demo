// sso服务
const express = require('express');
const path = require('path');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 模拟用户数据库
const users = [
  { id: 1, username: '1', password: '1' },
];

// 登录页面
app.get('/login', (req, res) => {
  fs.readFile(path.resolve(__dirname, 'login.html'), 'utf8', (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } else {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    }
  });
});

// 处理登录请求
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) {
    return res.json({ code: -1 });
  }
  // 生成 ticket
  const ticket = `ticket_${Date.now()}_${user.id}`;
  res.cookie('ticket', ticket, { httpOnly: true });
  // 返回登录成功json
  res.json({ code: 0, data: { ticket } });
});

// 验证 ticket 的中间件
const authenticateTicket = (req, res, next) => {
  const ticket = req.cookies.ticket || '';
  if (!ticket) {
    req.user = { id: null };
  }
  // 这里可以根据 ticket 进行进一步的验证，比如检查是否过期等
  req.user = { id: ticket.split('_')[2] };
  if (!req.user.id) {
    req.user = { id: null };
  } else {
    next();
  }
};

// 需要登录才能访问的页面
app.get('/', authenticateTicket, (req, res) => {
  if (!req.user.id) {
    return res.redirect(`http://localhost:3000/login?redirect=${encodeURIComponent('http://localhost:3000')}`);
  } else {
    res.end(`Welcome, user ${req.user.id}`);
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`SSO server running on port ${PORT}`);
});