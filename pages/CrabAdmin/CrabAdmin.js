var app = getApp();
Page({
  data: {
    imgList: [],
    name: '',
    isUploads: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  // 获取名称
  getName(e) {
    this.setData({
      name: e.detail.value
    })
  },

  // 新增
  add: function() {
    var that = this;
    var name = this.data.name;
    var imgList = this.data.imgList;
    var date = String((new Date()).valueOf());
    var img = [];
    console.log(this.data.imgList.length)
    if (name == '' || this.data.imgList.length < 5) {
      wx.showToast({
        title: '国家名不能为空且必须上传 5 张图片！',
        icon: 'none'
      })
    } else {
      wx.showModal({
        content: '是否新增「' + name + '」地图？',
        cancelText: '再看看',
        confirmText: '新增',
        confirmColor: "green",
        success: res => {
          if (res.confirm) {
            this.setData({
              isUploads: false
            })

            // 云能力初始化
            wx.cloud.init();
            const db = wx.cloud.database();

            // 上传动画
            wx.showLoading({
              title: '上传中...',
              mask: true
            })

            // 循环储存上传图片
            for (var i = 0; i < imgList.length; i++) {
              wx.cloud.uploadFile({
                cloudPath: Math.round(Math.random() * 1000000) + date + Math.round(Math.random() * 1000000) + '.png', // 上传至云端的路径
                filePath: imgList[i], // 小程序本地文件路径
                success(res) {
                  img.push(res.fileID)
                  if (img.length == 6) {

                    // 储存图片路径轮播图名称
                    db.collection('Poster').add({
                      data: {
                        name: name,
                        imgList: [{
                            'id': 1,
                            'type': 'image',
                            'url': img[0]
                          },
                          {
                            'id': 2,
                            'type': 'image',
                            'url': img[1]
                          },
                          {
                            'id': 3,
                            'type': 'image',
                            'url': img[2]
                          },
                          {
                            'id': 4,
                            'type': 'image',
                            'url': img[3]
                          },
                          {
                            'id': 5,
                            'type': 'image',
                            'url': img[4]
                          },
                          {
                            'id': 6,
                            'type': 'image',
                            'url': img[5]
                          },
                        ],
                        swiperHeight: that.data.swiperHeight,
                        date: new Date(),
                        isShow: 1
                      },
                      success: function(res) {
                        console.log(res)
                        wx.hideLoading();
                        wx.showToast({
                          title: '上传成功',
                        })
                        that.setData({
                          isShow: true
                        })
                      }
                    })
                  }
                },
                fail(err) {
                  console.error(err)
                  wx.showToast({
                    title: '上传失败，请检查网络是否通畅...',
                    icon: 'none'
                  })
                  that.setData({
                    isFail: true
                  })
                }
              })
            }
          }
        }
      })
    }
  },

  // 返回
  exit() {
    wx.navigateBack({
      delta: 1
    })
  },

  chooseImage: function() {
    wx.chooseImage({
      count: 6, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album'], // 从相册选择
      success: (res) => {
        if (this.data.imgList.length != 0) {
          this.setData({
            imgList: this.data.imgList.concat(res.tempFilePaths)
          })
          if (this.data.imgList.length > 6) {
            var img = this.data.imgList.slice(0, 6);
            this.setData({
              imgList: img
            })
          }
        } else {
          this.setData({
            imgList: res.tempFilePaths
          })
        }
      }
    });
  },

  // 获取图片宽高比
  imgLoad(e) {
    var swiperHeight = app.globalData.ScreenWidth * e.detail.height / e.detail.width + 'rpx';
    this.setData({
      swiperHeight: swiperHeight
    })
  },

  // 预览图片
  viewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },

  // 移除图片 
  delImg(e) {
    wx.showModal({
      content: '是否移除？',
      cancelText: '再想想',
      confirmText: '移除',
      confirmColor: "red",
      success: res => {
        if (res.confirm) {
          this.data.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            imgList: this.data.imgList
          })
        }
      }
    })
  }
})