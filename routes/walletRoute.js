const express = require('express');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const router = express.Router();
const lang2 = require('./lang2.json');
const lang = require('./lang.json');

router.get('/balance',auth, async (req, res) => {
  const userId=req.user._id;
  const wallet=await Wallet.findOne({user:userId}).lean();

  if (!wallet) {

    const wallets= new Wallet({
      user:userId
    })

    await wallets.save()

   return res.send({success:true,wallet:wallets});
  }

  res.send({
    success:true,
    wallet
  });
});
router.put('/add',auth, async (req, res) => {
  const userId=req.user._id;
  const {balance}=req.body
  const wallet=await Wallet.findOne({user:userId});

  
  const transaction = new Transaction({
    user: userId,
    balance: balance,
    type: "deposit",
    description: balance+ lang2["dep"],
  });
  await transaction.save();

  if (!wallet) {

    const wallets= new Wallet({
      user:userId,
      balance:balance
    })

    await wallets.save()

   return res.send({success:true,message:req.user.lang=='spanish'?lang2["balcadd"]:lang["balcadd"],wallet:wallets});
  }
  wallet.balance=Number(wallet.balance)+Number(balance)

  await wallet.save()

  res.send({
    success:true,
    wallet,
    message:req.user.lang=='spanish'?lang2["balcadd"]:lang["balcadd"],
  });
});

router.put('/withdraw',auth, async (req, res) => {
  const userId=req.user._id;
  const {balance,bankdetailId}=req.body
  const wallet=await Wallet.findOne({user:userId});
  
  if (!wallet) {
    return res.status("400").send({success:false,message:req.user.lang=='spanish'?lang2["nobalance"]:lang["nobalance"],});
  }
  
  if (Number(balance)>Number(wallet.balance)) {
    return res.status("400").send({success:false,message:req.user.lang=='spanish'?lang2["nobalance"]:lang["nobalance"],});
  }
  const transaction = new Transaction({
    user: userId,
    balance: balance,
    type: "withdraw",
    status:"pending",
    description: balance+ lang2["withdraw"],
    bankdetail:bankdetailId
  });
  await transaction.save();

  wallet.balance=Number(wallet.balance)-Number(balance)
  await wallet.save();

  res.send({
    success:true,
    wallet,
    message:req.user.lang=='spanish'?lang2["requestsent"]:lang["requestsent"],
  });
});

router.get('/transactions/:type/:id?',auth, async (req, res) => {
  const userId=req.user._id;
  let query = {};

  if (req.params.id) {
    query._id = { $lt: req.params.id };
  }
  if (req.params.type!=='all') { 
    query.type=req.params.type
  }
  query.user = userId;

  const transactions=await Transaction.find(query).sort({ _id: -1 }).limit(10).lean();

  res.send({
    success:transactions.length==0?false:true,
    transactions
  });
});

router.put('/admin/update/:id',auth,admin, async (req, res) => {
  const transactionId=req.params.id

  const {receipt}=req.body

  const transactions=await Transaction.findByIdAndUpdate(transactionId,{status:"completed",receipt:receipt},{new:true})
  
  if (!transactions) {
    return res.status("400").send({success:false,message:req.user.lang=='spanish'?lang2["transationnot"]:lang["transationnot"],});
  }

  res.send({
    success:true,
    transactions
  });
});

router.get('/admin/:id/:transtype/:type?',auth,admin, async (req, res) => {
  let query = {};

  const lastId = parseInt(req.params.id)||1;

  // Check if lastId is a valid number
  if (isNaN(lastId) || lastId < 0) {
    return res.status(400).json({ error:req.user.lang=='spanish'?lang2["Invalid_last_id"]:lang["Invalid_last_id"] });
  }
  
  const pageSize = 10;

  const skip = Math.max(0, (lastId - 1)) * pageSize;

  if (req.params.type) { 
    query.status=req.params.type
  }

  if (req.params.transtype !== 'all') { 
    query.type=req.params.transtype
  }

  try {
    const posts = await Transaction.find(query).populate("user").populate("bankdetail")
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pageSize).lean();    

    const totalCount = await Transaction.find(query);
    const totalPages = Math.ceil(totalCount.length / pageSize);
    const totalAmount=totalCount.reduce((a,b)=>a+b.balance,0)

    if (posts.length > 0) {
      res.status(200).json({ success: true, Transactions: posts,count: { totalPage: totalPages, currentPageSize: posts.length } ,totalAmount });
    } else {
      res.status(200).json({ success: false, Transactions:[],message: req.user.lang=='spanish'?lang2["nome"]:lang["nome"],count: { totalPage: totalPages, currentPageSize: posts.length } ,totalAmount });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: req.user.lang=='spanish'?lang2["error"]:lang["error"]});
  }
});

module.exports = router; 
