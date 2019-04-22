mui.init({
	beforeback:function(){
		var parent = plus.webview.currentWebview().opener();
		parent.close({aniClose:'none'});
		return true;
	}
})
mui.plusReady(function(){
	var uuid = plus.device.uuid;		//设备的唯一标识码
	
	//初始化读取登录帐号
	if(localStorage.account != undefined){
		$('#mobile').val(localStorage.account);
	}
	
	/**
	 * @Author      JackyQ
	 * @DateTime    2018-06-02
	 * @version     1.0.0
	 * @description 跳转注册
	 */
	$('#gotoRegister').click(function(){
		mui.openWindow({
			url:'../register/register.html',
			id:"register",
			createNew:false,
			show:{
				aniShow:"fade-in"
			},
			waiting:{
				autoShow:false
			}
		})
	});

	/**
	 * @Author      JackyQ
	 * @DateTime    2018-06-02
	 * @version     1.0.0
	 * @description 跳转用户名密码登录 
	 */
	$('#gotoLogin').click(function(){
		mui.openWindow({
			url:'../login/login.html',
			id:'login',
			createNew:false,
			show:{
				aniShow:"fade-in"
			},
			waiting:{
				autoShow:false
			}
		});
	});
	
	/**
	 * @Author      JackyQ
	 * @DateTime    2018-08-014
	 * @version     1.0.0
	 * @description 跳转忘记密码
	 */
	$('#gotoLoginForget').click(function(){
		mui.openWindow({
			url:'../login_forget/login_forget.html',
			id:'login_forget',
			createNew:false,
			show:{
				aniShow:"fade-in"
			},
			waiting:{
				autoShow:false
			}
		});
	});

	/**
	 * @Author      JackyQ
	 * @DateTime    2018-05-31
	 * @version     1.0.0
	 * @description 获取验证码
	 */
	var timeSwitch = false;
	$('#getIdentfyCode').click(function() {
		// 验证手机号
		if($('#mobile').val() == ""){
			mui.toast('请填写手机号码');
			return false;
		}else if(validator.isMobilePhone($('#mobile').val(),'zh-CN') == false){
			mui.toast('请填写正确的手机号码');
			return false;
		}
		// 验证手机号
		var _this = $(this);
		if(timeSwitch === true){
			return false;
		}else{
			$.ajax({
				url: domain + '/api/user.Entry/loginSms',
				type: 'POST',
				data: {
					identifier: $('#mobile').val()
				},
				timeout: 10000,
				success: function(response){
					if(response == 1){
						changeCode(_this);
					}else if(response == 2){
						mui.toast('已超过验证码短信限额，请稍候重试');
					}else if(response == 3){
						mui.toast('手机号不存在，请先进行注册');
					}else{
						mui.toast('未知错误');
					}
				},
				error: function(xhr,textStatus){
					if(textStatus=='timeout'){
						//处理超时的逻辑
						mui.toast('请求超时');
					}
					else{
						//其他错误的逻辑
						mui.toast('未知错误');
					}
				}
			});
		}
	});

	/**
	 * @Author      JackyQ
	 * @DateTime    2018-05-31
	 * @version     1.0.0
	 * @description 获取验证码倒计时
	 */
	function changeCode(_this){
		_this.text('180秒后可重新获取').removeClass('register-orange-text').addClass('register-gray-text');
		var time = 180;		//设置重新获取时间
		inter = setInterval(function(){
			if(time > 1){
				time -= 1;
				timeSwitch = true;
				_this.text(time+'秒后可重新获取');
			}else{
				_this.text('获取验证码').removeClass('register-gray-text').addClass('register-orange-text');
				clearInterval(inter);
				timeSwitch = false;
			}
		},1000);
	}

	/**
	 * @Author      JackyQ
	 * @DateTime    2018-06-01
	 * @version     1.0.0
	 * @description 提交注册表单
	 */
	$('#register').click(function(){
		if(registerCheck() == false){
			return;
		}
		$.ajax({
			url: domain + '/api/user.Entry/Login',
			type: 'POST',
			data: {
				identifier: $('#mobile').val(),
				mobilelz: $('#mobilelz').val(),
				uuid: uuid,
				identity_type: 2
			},
			timeout: 10000,
			error: ajaxError,
			success: function(res){
				var res = JSON.parse(res);
				if(res.state == 1){
					mui.toast('登录成功');
					localStorage.token = res.token;
					localStorage.account = $('#mobile').val();

					//通知个人中心页面刷新数据
					var target = plus.webview.getWebviewById('../personalCenter/personalCenter.html');
					mui.fire(target,"refreshData",{});
					
					//通知首页重新获取登录后的信息
					var indexWebview = plus.webview.getLaunchWebview();
					mui.fire(indexWebview,"login",{});

					setTimeout(function(){
						mui.back();
					}, 500);
				}else if(res.state == 2){
					mui.toast('用户不存在');
				}else if(res.state == 3){
					mui.toast('用户名或错误，请核实');
				}else if(res.state == 4){
					mui.toast('用户状态异常');
				}else if(res.state == 5){
					mui.toast('验证码错误');
				}else{
					mui.toast('未知错误');
				}
			}
		});
	});

	/**
	 * @Author      JackyQ
	 * @DateTime    2018-06-01
	 * @version     1.0.0
	 * @description 注册验证
	 */
	function registerCheck(){
		if($('#mobile').val() == ""){
			mui.toast('请填写手机号码');
			return false;
		}else if(validator.isMobilePhone($('#mobile').val(),'zh-CN') == false){
			mui.toast('请填写正确的手机号码');
			return false;
		}else if($('#mobilelz').val() == ""){
			mui.toast('请填写验证码');
			return false;
		}else{
			return true;
		}
	}
});