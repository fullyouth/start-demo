const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());

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
  } 
  next();
};

// 需要登录才能访问的页面
app.get('/appA', authenticateTicket, (req, res) => {
  // 获取当前页面的url
  const url = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log('url:', url); 
  if (!req.user.id) {
    return res.redirect(`http://localhost:3000/login?redirect=${encodeURIComponent(url)}`);
  } else {
    res.end(`Welcome, user ${req.user.id}`);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`App A running on port ${PORT}`);
});