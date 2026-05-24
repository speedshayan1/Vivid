function app() {
    return {
        view: 'home',
        isLoggedIn: false,
        authMode: 'login',
        errorMessage: '',
        loginData: { username: '', password: '' },
        signupData: { email: '', name: '', username: '', password: '' },
        showCreateModal: false,
        showEditProfileModal: false,
        showFollowModal: false,
        followModalType: '', // 'followers' or 'following'
        followModalTitle: '',
        followModalUsers: [],
        editProfileData: { name: '', image: '', bio: '' },
        availableMusic: [
            { name: 'Original Sound - Vivid Music', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
            { name: 'Happy Beats - Sarah J', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
            { name: 'Lo-fi Study - Mike', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
            { name: 'Ethereal - Emily Spark', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
            { name: 'Grand Launch - Shayan', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
            { name: 'Summer Hits 2024', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
            { name: 'Chill Lofi Hip Hop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
            { name: 'Techno Party Mix', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
            { name: 'Jazz Vibes for Work', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
            { name: 'Epic Cinematic Trailer', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3' }
        ],
        showCommentsModal: false,
        currentCommentsPost: null,
        openCommentsModal(post) {
            this.currentCommentsPost = post;
            this.showCommentsModal = true;
        },
        sharePost(post) {
            if (navigator.share) {
                navigator.share({
                    title: 'Vivid Post by ' + post.username,
                    text: post.caption,
                    url: window.location.href,
                }).catch(console.error);
            } else {
                // Fallback: Copy to clipboard
                const dummy = document.createElement('input');
                document.body.appendChild(dummy);
                dummy.value = window.location.href;
                dummy.select();
                document.execCommand('copy');
                document.body.removeChild(dummy);
                alert('Link copied to clipboard!');
            }
        },
        isMuted: true,
        currentShortAudioUrl: '',
        currentShortIndex: 0,
        toggleMute() {
            this.isMuted = !this.isMuted;
            const audio = this.$refs.shortsAudio;
            if (this.isMuted) {
                audio.pause();
            } else {
                audio.play().catch(e => console.log('Autoplay blocked or error:', e));
            }
        },
        handleShortsNav(direction) {
            if (this.view !== 'shorts') return;
            const container = this.$refs.shortsContainer;
            if (!container) return;

            const height = container.clientHeight;
            if (direction === 'down') {
                if (this.currentShortIndex < this.shortsContent.length - 1) {
                    this.currentShortIndex++;
                    container.scrollTop += height;
                }
            } else {
                if (this.currentShortIndex > 0) {
                    this.currentShortIndex--;
                    container.scrollTop -= height;
                }
            }
            this.updateShortsAudio();
        },
        generateBots() {
            const firstNames = ['James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
            const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
            const interests = ['Travel', 'Tech', 'Food', 'Art', 'Fitness', 'Music', 'Nature', 'Gaming', 'Fashion', 'Photography'];
            
            const bots = Array.from({ length: 200 }, (_, i) => {
                const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
                const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
                const username = `${firstName.toLowerCase()}_${lastName.toLowerCase()}_${Math.floor(Math.random() * 9999)}`;
                const interest = interests[Math.floor(Math.random() * interests.length)];
                
                return {
                    username: username,
                    name: `${firstName} ${lastName}`,
                    password: 'bot',
                    image: `https://i.pravatar.cc/150?u=${username}`,
                    bio: `${interest} enthusiast | Sharing my journey on Vivid ✨`,
                    following: [],
                    followers: [],
                    isBot: true
                };
            });
            
            return bots;
        },
        updateShortsAudio() {
            if (this.view !== 'shorts') {
                if (this.$refs.shortsAudio) this.$refs.shortsAudio.pause();
                return;
            }
            const short = this.shortsContent[this.currentShortIndex];
            if (short) {
                this.currentShortAudioUrl = short.audioUrl;
                this.$nextTick(() => {
                    const audio = this.$refs.shortsAudio;
                    if (audio && !this.isMuted) {
                        audio.play().catch(e => console.log('Audio playback error:', e));
                    }
                });
            }
        },
        init() {
            this.initPosts();
            this.initMessages();
            this.initNotifications();
            this.initShorts();

            const savedUsers = localStorage.getItem('vivid_users');
            if (savedUsers) {
                this.allUsers = JSON.parse(savedUsers);
                // Ensure all users have following/followers arrays
                this.allUsers.forEach(u => {
                    if (!u.following) u.following = [];
                    if (!u.followers) u.followers = [];
                });
            } else {
                // Default admin user for testing
                const initialUsers = [
                    { 
                        username: 'shayan.dev', 
                        name: 'Shayan', 
                        password: '123', 
                        image: 'https://i.pravatar.cc/150?u=me',
                        following: [],
                        followers: []
                    },
                    { username: 'alex_vivid', name: 'Alex Rivera', image: 'https://i.pravatar.cc/150?u=alex', following: [], followers: [] },
                    { username: 'sarah_j', name: 'Sarah Johnson', image: 'https://i.pravatar.cc/150?u=sarah', following: [], followers: [] },
                    { username: 'mike_vivid', name: 'Mike Chen', image: 'https://i.pravatar.cc/150?u=mike', following: [], followers: [] },
                    { username: 'emily_spark', name: 'Emily Spark', image: 'https://i.pravatar.cc/150?u=emily', following: [], followers: [] },
                    { username: 'travel_junkie', name: 'Leo World', image: 'https://i.pravatar.cc/150?u=travel', following: [], followers: [] },
                    { username: 'fitness_pro', name: 'Coach Sarah', image: 'https://i.pravatar.cc/150?u=fitness', following: [], followers: [] },
                    { username: 'chef_mario', name: 'Mario Batali', image: 'https://i.pravatar.cc/150?u=chef', following: [], followers: [] },
                    { username: 'tech_guru', name: 'Tech Reviews', image: 'https://i.pravatar.cc/150?u=tech', following: [], followers: [] },
                    { username: 'art_gallery', name: 'Creative Soul', image: 'https://i.pravatar.cc/150?u=art', following: [], followers: [] },
                    { username: 'nature_pics', name: 'Wild Life', image: 'https://i.pravatar.cc/150?u=nature', following: [], followers: [] },
                    { username: 'gaming_king', name: 'Pro Gamer', image: 'https://i.pravatar.cc/150?u=game', following: [], followers: [] },
                    { username: 'fashion_icon', name: 'Style Queen', image: 'https://i.pravatar.cc/150?u=fashion', following: [], followers: [] },
                    { username: 'music_lover', name: 'Sound Master', image: 'https://i.pravatar.cc/150?u=music', following: [], followers: [] },
                    { username: 'pet_hub', name: 'Animal Lover', image: 'https://i.pravatar.cc/150?u=pets', following: [], followers: [] }
                ];
                
                const bots = this.generateBots();
                this.allUsers = [...initialUsers, ...bots];
                localStorage.setItem('vivid_users', JSON.stringify(this.allUsers));
            }

            const savedAuth = localStorage.getItem('vivid_current_user');
            if (savedAuth) {
                this.isLoggedIn = true;
                this.currentUser = JSON.parse(savedAuth);
            }

            const savedRecent = localStorage.getItem('recent_searches');
            if (savedRecent) this.recentSearches = JSON.parse(savedRecent);

            this.$watch('view', (value) => {
                this.updateShortsAudio();
            });

            this.$nextTick(() => {
                const container = this.$refs.shortsContainer;
                if (container) {
                    container.addEventListener('scroll', () => {
                        if (this.view !== 'shorts') return;
                        const index = Math.round(container.scrollTop / container.clientHeight);
                        if (index !== this.currentShortIndex) {
                            this.currentShortIndex = index;
                            this.updateShortsAudio();
                        }
                    });
                }
            });
        },
        shortsContent: [],
        initShorts() {
            const captions = [
                'Enjoying this amazing view! 🌟 #vivid #shorts #vibes',
                'Life is better when you are laughing. 😂',
                'Coding my way through the weekend! 💻',
                'Magic in the air. ✨',
                'Vivid is officially live! 🚀',
                'Check out this cool transition! 🎬',
                'Monday morning motivation. 💪',
                'Can\'t believe this just happened! 😱',
                'Summer vibes only. ☀️🏖️',
                'Cooking something special today. 🍳',
                'Exploring the hidden gems of the city. 🏙️',
                'This sunset is everything. 🌅',
                'New workout routine is killing me! 🔥',
                'Art is not what you see, but what you make others see. 🎨',
                'Wild and free in nature. 🌲',
                'Gaming session with the squad! 🎮',
                'OOTD: Style meets comfort. 👗',
                'Music is the language of the soul. 🎵',
                'Look at these cute puppies! 🐶',
                'The perfect cup of coffee. ☕'
            ];
            const musicList = [
                { name: 'Original Sound - Vivid Music', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
                { name: 'Happy Beats - Sarah J', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
                { name: 'Lo-fi Study - Mike', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
                { name: 'Ethereal - Emily Spark', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
                { name: 'Grand Launch - Shayan', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
                { name: 'Summer Hits 2024', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3' },
                { name: 'Chill Lofi Hip Hop', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3' },
                { name: 'Techno Party Mix', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3' },
                { name: 'Jazz Vibes for Work', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3' },
                { name: 'Epic Cinematic Trailer', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3' }
            ];
            
            const randomComments = [
                'This is fire! 🔥',
                'Love the vibes here.',
                'Where was this filmed?',
                'So cool! 🤩',
                'Need the song name!',
                'Amazing work as always.',
                'Vivid is the best app for this.',
                'Check my latest short too!',
                'Wow, just wow.',
                'Keep it up! 🚀'
            ];

            const userShorts = JSON.parse(localStorage.getItem('vivid_user_shorts') || '[]');
            
            const generatedShorts = Array.from({ length: 1500 }, (_, i) => {
                const randomUser = this.allUsers[Math.floor(Math.random() * this.allUsers.length)];
                const randomMusic = musicList[Math.floor(Math.random() * musicList.length)];
                
                // Generate 2-5 random comments for each short
                const commentCount = Math.floor(Math.random() * 4) + 2;
                const shortComments = Array.from({ length: commentCount }, (_, cIdx) => {
                    const commenter = this.allUsers[Math.floor(Math.random() * this.allUsers.length)];
                    return {
                        id: Date.now() + i + cIdx,
                        username: commenter.username,
                        text: randomComments[Math.floor(Math.random() * randomComments.length)],
                        time: Math.floor(Math.random() * 59) + 'm',
                        replies: []
                    };
                });

                const isVideo = Math.random() > 0.5; // 50% chance of video
                return {
                    id: i + 1,
                    username: randomUser.username,
                    caption: captions[Math.floor(Math.random() * captions.length)],
                    music: randomMusic.name,
                    audioUrl: randomMusic.url,
                    image: isVideo 
                        ? `https://www.w3schools.com/html/mov_bbb.mp4` 
                        : `https://picsum.photos/seed/shorts${i + 1}/1080/1920`,
                    likes: Math.floor(Math.random() * 50) + 10,
                    isLiked: false,
                    comments: shortComments.length,
                    commentList: shortComments,
                    type: isVideo ? 'video' : 'image'
                };
            });

            this.shortsContent = [...userShorts, ...generatedShorts];
            this.updateShortsAudio();
        },
        currentUser: null,
        viewedUser: null,
        messageTab: 'chats',
        notifications: [],
        initNotifications() {
            const savedNotifs = localStorage.getItem('vivid_notifications');
            if (savedNotifs) {
                this.notifications = JSON.parse(savedNotifs);
            } else {
                this.notifications = [
                    { id: 1, type: 'like', user: { username: 'alex_vivid', image: 'https://i.pravatar.cc/150?u=alex' }, content: 'liked your photo.', time: '2m', postImage: 'https://picsum.photos/seed/vivid/100/100' },
                    { id: 2, type: 'follow', user: { username: 'sarah_j', image: 'https://i.pravatar.cc/150?u=sarah' }, content: 'started following you.', time: '1h', isFollowing: false },
                    { id: 3, type: 'comment', user: { username: 'mike_vivid', image: 'https://i.pravatar.cc/150?u=mike' }, content: 'commented: "This is amazing! 🔥"', time: '3h', postImage: 'https://picsum.photos/seed/vivid/100/100' },
                    { id: 4, type: 'like', user: { username: 'emily_spark', image: 'https://i.pravatar.cc/150?u=emily' }, content: 'liked your photo.', time: '5h', postImage: 'https://picsum.photos/seed/vivid/100/100' }
                ];
                localStorage.setItem('vivid_notifications', JSON.stringify(this.notifications));
            }
        },
        login() {
            this.errorMessage = '';
            if (!this.loginData.username || !this.loginData.password) {
                this.errorMessage = 'Please fill in all fields.';
                return;
            }

            const user = this.allUsers.find(u => 
                u.username.toLowerCase() === this.loginData.username.toLowerCase() && 
                u.password === this.loginData.password
            );

            if (user) {
                this.isLoggedIn = true;
                this.currentUser = user;
                localStorage.setItem('vivid_current_user', JSON.stringify(user));
                this.loginData = { username: '', password: '' };
            } else {
                this.errorMessage = 'Invalid username or password.';
            }
        },
        signup() {
            this.errorMessage = '';
            if (!this.signupData.username || !this.signupData.password || !this.signupData.name) {
                this.errorMessage = 'Please fill in all required fields.';
                return;
            }

            if (this.allUsers.find(u => u.username.toLowerCase() === this.signupData.username.toLowerCase())) {
                this.errorMessage = 'Username already exists.';
                return;
            }

            const newUser = {
                username: this.signupData.username,
                name: this.signupData.name,
                password: this.signupData.password,
                image: `https://i.pravatar.cc/150?u=${this.signupData.username}`,
                following: [],
                followers: []
            };

            this.allUsers.unshift(newUser);
            localStorage.setItem('vivid_users', JSON.stringify(this.allUsers));
            
            this.isLoggedIn = true;
            this.currentUser = newUser;
            localStorage.setItem('vivid_current_user', JSON.stringify(newUser));
            this.signupData = { email: '', name: '', username: '', password: '' };
        },
        logout() {
            this.isLoggedIn = false;
            this.currentUser = null;
            localStorage.removeItem('vivid_current_user');
        },
        openEditProfile() {
            this.editProfileData.name = this.currentUser.name;
            this.editProfileData.image = this.currentUser.image || '';
            this.editProfileData.bio = this.currentUser.bio || '';
            this.showEditProfileModal = true;
        },
        openFollowModal(type) {
            const user = this.viewedUser || this.currentUser;
            this.followModalType = type;
            this.followModalTitle = type === 'followers' ? 'Followers' : 'Following';
            
            const list = type === 'followers' ? user.followers : user.following;
            this.followModalUsers = this.allUsers.filter(u => list.includes(u.username));
            this.showFollowModal = true;
        },
        saveProfile() {
            if (!this.editProfileData.name) return;
            
            const myUser = this.allUsers.find(u => u.username === this.currentUser.username);
            myUser.name = this.editProfileData.name;
            myUser.image = this.editProfileData.image;
            myUser.bio = this.editProfileData.bio;

            // Update all current user's posts with new image if needed
            this.posts.forEach(p => {
                if (p.username === myUser.username) {
                    p.userImage = myUser.image;
                }
            });

            localStorage.setItem('vivid_users', JSON.stringify(this.allUsers));
            localStorage.setItem('vivid_posts', JSON.stringify(this.posts));
            
            this.currentUser = { ...myUser };
            localStorage.setItem('vivid_current_user', JSON.stringify(this.currentUser));
            
            this.showEditProfileModal = false;
        },
        navItems: [
            { label: 'Home', icon: 'fa-light fa-house', activeIcon: 'fa-solid fa-house', view: 'home' },
            { label: 'Search', icon: 'fa-light fa-magnifying-glass', activeIcon: 'fa-solid fa-magnifying-glass', view: 'search' },
            { label: 'Shorts', icon: 'fa-light fa-clapperboard', activeIcon: 'fa-solid fa-clapperboard', view: 'shorts' },
            { label: 'Explore', icon: 'fa-light fa-compass', activeIcon: 'fa-solid fa-compass', view: 'explore' },
            { label: 'Messages', icon: 'fa-light fa-paper-plane', activeIcon: 'fa-solid fa-paper-plane', view: 'messages' },
            { label: 'Profile', icon: 'fa-light fa-circle-user', activeIcon: 'fa-solid fa-circle-user', view: 'profile' },
        ],
        searchQuery: '',
        recentSearches: [],
        allUsers: [
            { username: 'shayan.dev', name: 'Shayan', image: 'https://i.pravatar.cc/150?u=me' },
        ],
        get filteredUsers() {
            if (!this.searchQuery) return [];
            return this.allUsers.filter(u => 
                u.username.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                u.name.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
        },
        addToRecent(user) {
            if (!this.recentSearches.find(u => u.username === user.username)) {
                this.recentSearches.unshift(user);
                if (this.recentSearches.length > 5) this.recentSearches.pop();
                localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
            }
        },
        removeFromRecent(username) {
            this.recentSearches = this.recentSearches.filter(u => u.username !== username);
            localStorage.setItem('recent_searches', JSON.stringify(this.recentSearches));
        },
        posts: [],
        initPosts() {
            const savedPosts = localStorage.getItem('vivid_posts');
            if (savedPosts) {
                this.posts = JSON.parse(savedPosts);
                // Ensure all posts have commentList and type
                this.posts.forEach(p => {
                    if (!p.commentList) p.commentList = [];
                    if (!p.type) p.type = 'image';
                    p.commentList.forEach(c => {
                        if (!c.replies) c.replies = [];
                    });
                });
            } else {
                const botCaptions = [
                    'Living my best life! ✨',
                    'Coffee and code. ☕💻',
                    'Exploring the city streets.',
                    'Fresh vibes only. 🌿',
                    'Weekend getaway! 🚗',
                    'New beginnings. 🌅',
                    'Captured a perfect moment.',
                    'Just another day in paradise.',
                    'Focus on the good. 🎯',
                    'Adventure awaits! 🌍',
                    'Golden hour magic. ✨🌇',
                    'Stay humble, stay original.',
                    'Making memories all over the world. ✈️',
                    'Mindset is everything.',
                    'Do more of what makes you happy.',
                    'Chasing dreams and sunsets. 🏃‍♂️🌅',
                    'Life is short, make it sweet. 🍭',
                    'Grateful for the little things.',
                    'Success is a journey, not a destination.',
                    'Be the energy you want to attract.'
                ];

                const botPosts = Array.from({ length: 500 }, (_, i) => {
                    const bot = this.allUsers[Math.floor(Math.random() * this.allUsers.length)];
                    const isVideo = Math.random() > 0.8; // 20% chance of video for feed
                    return {
                        id: Date.now() + i,
                        username: bot.username,
                        userImage: bot.image,
                        image: isVideo 
                            ? `https://www.w3schools.com/html/mov_bbb.mp4` 
                            : `https://picsum.photos/seed/feedpost${i}/800/800`,
                        type: isVideo ? 'video' : 'image',
                        likes: Math.floor(Math.random() * 1000) + 50,
                        isLiked: false,
                        caption: botCaptions[Math.floor(Math.random() * botCaptions.length)],
                        time: Math.floor(Math.random() * 23) + 'h ago',
                        comments: Math.floor(Math.random() * 50),
                        commentList: []
                    };
                });

                this.posts = [
                    {
                        id: Date.now(),
                        username: 'shayan.dev',
                        userImage: 'https://i.pravatar.cc/150?u=me',
                        image: 'https://picsum.photos/seed/vivid/800/800',
                        type: 'image',
                        likes: 0,
                        isLiked: false,
                        caption: 'Welcome to Vivid! 🚀 Start by posting something amazing.',
                        time: 'Just now',
                        comments: 0,
                        commentList: []
                    },
                    ...botPosts
                ];
                localStorage.setItem('vivid_posts', JSON.stringify(this.posts));
            }
        },
        commentInputs: {},
        addComment(post) {
            const text = this.commentInputs[post.id];
            if (!text || !text.trim() || !this.currentUser) return;

            const newComment = {
                id: Date.now(),
                username: this.currentUser.username,
                text: text.trim(),
                time: 'Just now',
                replies: []
            };

            if (!post.commentList) post.commentList = [];
            post.commentList.push(newComment);
            post.comments = post.commentList.length;
            
            this.commentInputs[post.id] = '';
            localStorage.setItem('vivid_posts', JSON.stringify(this.posts));
        },
        replyTo: null,
        showPostDetailModal: false,
        currentDetailPost: null,
        showShareModal: false,
        currentSharePost: null,
        lastTap: 0,
        openPostDetail(post) {
            this.currentDetailPost = post;
            this.showPostDetailModal = true;
        },
        openShareModal(post) {
            this.currentSharePost = post;
            this.showShareModal = true;
        },
        shareToFriend(user) {
            if (!this.currentSharePost || !this.currentUser) return;
            
            // Find or create conversation
            let conv = this.conversations.find(c => c.user.username === user.username);
            if (!conv) {
                conv = {
                    id: Date.now(),
                    user: user,
                    lastMessage: '',
                    time: 'Just now',
                    messages: [],
                    unread: false
                };
                this.conversations.unshift(conv);
            }
            
            const shareMsg = {
                sender: this.currentUser.username,
                text: `Shared a post: ${this.currentSharePost.caption}`,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isPostShare: true,
                post: this.currentSharePost
            };
            
            conv.messages.push(shareMsg);
            conv.lastMessage = 'Shared a post';
            conv.time = 'Just now';
            
            localStorage.setItem('vivid_messages', JSON.stringify(this.conversations));
            this.showShareModal = false;
            alert(`Post shared with ${user.username}!`);
        },
        handleDoubleTap(post) {
            const now = Date.now();
            const DOUBLE_TAP_DELAY = 300;
            if (now - this.lastTap < DOUBLE_TAP_DELAY) {
                if (!post.isLiked) {
                    this.toggleLike(post);
                }
                // Trigger heart animation (we'll add a class for this)
                post.showHeartAnim = true;
                setTimeout(() => post.showHeartAnim = false, 1000);
            }
            this.lastTap = now;
        },
        setReply(comment) {
            this.replyTo = comment;
            // Focus input
            this.$nextTick(() => {
                const input = document.getElementById('comment-input-modal');
                if (input) input.focus();
            });
        },
        addReply(post) {
            const text = this.commentInputs[post.id];
            if (!text || !text.trim() || !this.currentUser || !this.replyTo) return;

            const newReply = {
                id: Date.now(),
                username: this.currentUser.username,
                text: text.trim(),
                time: 'Just now'
            };

            if (!this.replyTo.replies) this.replyTo.replies = [];
            this.replyTo.replies.push(newReply);
            
            this.commentInputs[post.id] = '';
            this.replyTo = null;
            localStorage.setItem('vivid_posts', JSON.stringify(this.posts));
        },
        newPostData: { image: '', caption: '', type: 'image', destination: 'feed', music: null },
        createPost() {
            if (!this.newPostData.caption || !this.currentUser) return;
            
            // Basic check for video if image is a URL
            if (this.newPostData.image && (this.newPostData.image.includes('.mp4') || this.newPostData.image.includes('.webm'))) {
                this.newPostData.type = 'video';
            }

            if (this.newPostData.destination === 'shorts') {
                const short = {
                    id: Date.now(),
                    username: this.currentUser.username,
                    caption: this.newPostData.caption,
                    music: this.newPostData.music ? this.newPostData.music.name : 'Original Sound',
                    audioUrl: this.newPostData.music ? this.newPostData.music.url : 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
                    image: this.newPostData.image || `https://picsum.photos/seed/shorts${Date.now()}/1080/1920`,
                    likes: 0,
                    isLiked: false,
                    comments: 0,
                    commentList: [],
                    isUserCreated: true,
                    type: this.newPostData.type
                };

                const userShorts = JSON.parse(localStorage.getItem('vivid_user_shorts') || '[]');
                userShorts.unshift(short);
                localStorage.setItem('vivid_user_shorts', JSON.stringify(userShorts));
                
                this.initShorts(); // Reload shorts to include the new one
                this.view = 'shorts';
            } else {
                const post = {
                    id: Date.now(),
                    username: this.currentUser.username,
                    userImage: this.currentUser.image || '',
                    image: this.newPostData.image || `https://picsum.photos/seed/${Date.now()}/800/800`,
                    type: this.newPostData.type || 'image',
                    likes: 0,
                    isLiked: false,
                    caption: this.newPostData.caption,
                    time: 'Just now',
                    comments: 0,
                    commentList: []
                };
                
                this.posts.unshift(post);
                localStorage.setItem('vivid_posts', JSON.stringify(this.posts));
                this.view = 'home';
            }
            
            this.showCreateModal = false;
            this.newPostData = { image: '', caption: '', type: 'image', destination: 'feed', music: null };
        },
        toggleLike(post) {
            post.isLiked = !post.isLiked;
            post.isLiked ? post.likes++ : post.likes--;
            localStorage.setItem('vivid_posts', JSON.stringify(this.posts));
        },
        toggleLikeShort(short) {
            short.isLiked = !short.isLiked;
            short.isLiked ? short.likes++ : short.likes--;
            
            // Persist if it's a user created short
            if (short.isUserCreated) {
                const userShorts = JSON.parse(localStorage.getItem('vivid_user_shorts') || '[]');
                const index = userShorts.findIndex(s => s.id === short.id);
                if (index !== -1) {
                    userShorts[index] = short;
                    localStorage.setItem('vivid_user_shorts', JSON.stringify(userShorts));
                }
            }
        },
        conversations: [],
        currentChat: null,
        newMessageText: '',
        initMessages() {
            const savedMessages = localStorage.getItem('vivid_messages');
            if (savedMessages) {
                this.conversations = JSON.parse(savedMessages);
            } else {
                // Default mock conversations
                this.conversations = [
                    {
                        id: 1,
                        user: { username: 'alex_vivid', name: 'Alex Rivera', image: 'https://i.pravatar.cc/150?u=alex' },
                        lastMessage: 'That post was fire! 🔥',
                        time: '2m',
                        unread: true,
                        messages: [
                            { text: 'Hey, did you see the new update?', sender: 'alex_vivid', time: '10:30 AM' },
                            { text: 'Yeah, looks amazing!', sender: 'shayan.dev', time: '10:31 AM' },
                            { text: 'That post was fire! 🔥', sender: 'alex_vivid', time: '10:35 AM' }
                        ]
                    },
                    {
                        id: 2,
                        user: { username: 'sarah_j', name: 'Sarah Johnson', image: 'https://i.pravatar.cc/150?u=sarah' },
                        lastMessage: 'Sent a photo',
                        time: '1h',
                        unread: false,
                        messages: [
                            { text: 'Good morning!', sender: 'sarah_j', time: 'Yesterday' },
                            { text: 'Sent a photo', sender: 'sarah_j', time: '1h ago' }
                        ]
                    }
                ];
                localStorage.setItem('vivid_messages', JSON.stringify(this.conversations));
            }
        },
        openChat(conversation) {
            this.currentChat = conversation;
            conversation.unread = false;
            localStorage.setItem('vivid_messages', JSON.stringify(this.conversations));
            this.scrollToBottom();
        },
        startChat(user) {
            let existing = this.conversations.find(c => c.user.username === user.username);
            if (existing) {
                this.openChat(existing);
            } else {
                const newChat = {
                    id: Date.now(),
                    user: { username: user.username, name: user.name, image: '' },
                    lastMessage: 'Started a new conversation',
                    time: 'Just now',
                    unread: false,
                    messages: []
                };
                this.conversations.unshift(newChat);
                localStorage.setItem('vivid_messages', JSON.stringify(this.conversations));
                this.openChat(newChat);
            }
            this.view = 'messages';
            this.messageTab = 'chats';
        },
        sendMessage() {
            if (!this.newMessageText.trim() || !this.currentChat || !this.currentUser) return;
            
            const senderUsername = this.currentUser.username;
            const recipientUsername = this.currentChat.user.username;
            const text = this.newMessageText;
            
            const newMsg = {
                text: text,
                sender: senderUsername,
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            
            this.currentChat.messages.push(newMsg);
            this.currentChat.lastMessage = text;
            this.currentChat.time = 'Just now';
            this.newMessageText = '';
            
            localStorage.setItem('vivid_messages', JSON.stringify(this.conversations));
            
            this.scrollToBottom();

            // Simulate "Talking Back"
            this.simulateReply(recipientUsername);
        },
        simulateReply(username) {
            const responses = [
                "That's awesome! 🔥",
                "I totally agree with you.",
                "Haha, that's so true! 😂",
                "Wait, really? I didn't know that.",
                "Let's catch up soon!",
                "Did you see my latest post?",
                "Vivid is looking great today!",
                "Nice! check out the new shorts I just watched."
            ];

            // Wait 1.5 to 3 seconds before replying
            setTimeout(() => {
                if (!this.currentChat || this.currentChat.user.username !== username) return;

                const randomResponse = responses[Math.floor(Math.random() * responses.length)];
                const replyMsg = {
                    text: randomResponse,
                    sender: username,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };

                this.currentChat.messages.push(replyMsg);
                this.currentChat.lastMessage = randomResponse;
                this.currentChat.time = 'Just now';
                this.currentChat.unread = false; // They just sent it, so user hasn't "read" it yet but they are in the chat

                localStorage.setItem('vivid_messages', JSON.stringify(this.conversations));
                this.scrollToBottom();
            }, 2000);
        },
        scrollToBottom() {
            setTimeout(() => {
                const container = document.getElementById('chat-messages');
                if (container) container.scrollTop = container.scrollHeight;
            }, 50);
        },
        viewProfile(username) {
            const user = this.allUsers.find(u => u.username === username);
            if (user) {
                this.viewedUser = user;
                this.view = 'profile';
            }
        },
        handleFileUpload(event, target) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                if (target === 'profile') {
                    this.editProfileData.image = e.target.result;
                } else if (target === 'post') {
                    this.newPostData.image = e.target.result;
                    this.newPostData.type = file.type.startsWith('video/') ? 'video' : 'image';
                }
            };
            reader.readAsDataURL(file);
        },
        isFollowing(username) {
            if (!this.currentUser || !this.currentUser.following) return false;
            return this.currentUser.following.includes(username);
        },
        toggleFollow(user) {
            if (!this.currentUser) return;
            
            const myUser = this.allUsers.find(u => u.username === this.currentUser.username);
            const targetUser = this.allUsers.find(u => u.username === user.username);

            if (!myUser.following) myUser.following = [];
            if (!targetUser.followers) targetUser.followers = [];

            const index = myUser.following.indexOf(targetUser.username);
            if (index === -1) {
                // Follow
                myUser.following.push(targetUser.username);
                targetUser.followers.push(myUser.username);
                
                // Add notification for them
                this.addNotification(targetUser.username, 'started following you.', 'follow');
            } else {
                // Unfollow
                myUser.following.splice(index, 1);
                const followerIndex = targetUser.followers.indexOf(myUser.username);
                if (followerIndex !== -1) targetUser.followers.splice(followerIndex, 1);
            }

            // Save to localStorage
            localStorage.setItem('vivid_users', JSON.stringify(this.allUsers));
            
            // Update current session user
            this.currentUser = { ...myUser };
            localStorage.setItem('vivid_current_user', JSON.stringify(this.currentUser));
        },
        addNotification(recipientUsername, content, type) {
            const newNotif = {
                id: Date.now(),
                type: type,
                user: { username: this.currentUser.username, image: '' },
                content: content,
                time: 'Just now',
                isFollowing: false
            };
            this.notifications.unshift(newNotif);
            localStorage.setItem('vivid_notifications', JSON.stringify(this.notifications));
        }
    }
}