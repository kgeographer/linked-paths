import tweepy
key = 'CCLU2iBqq28vNoMusVDiUVROu'
token = '1067580330-1wUr6lGDEqHH1tyxzMPj7mbfLZIZhi6exsxGytx'
secret = 'k0lYYSwtZisak679yzpKnYUW821bfmkd87jv8MNCiWZF1UONbn'

auth = tweepy.OAuthHandler(key, secret)

try:
    redirect_url = auth.get_authorization_url()
except tweepy.TweepError:
    print('Error! Failed to get request token.')

api = tweepy.API(auth)
sarah = api.get_user('@SarahEBond')

