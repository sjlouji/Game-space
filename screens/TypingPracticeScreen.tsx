import React, { useState, useEffect, useRef, useCallback } from 'react';

type KeyStats = {
  errors: number;
  hits: number;
  attempts: number;
  lastErrorTime: number;
  delays: number[];
};

type KeyPairStats = {
  [pair: string]: { errors: number; hits: number };
};

type SessionStats = {
  wpm: number[];
  accuracy: number[];
  totalChars: number;
  correctChars: number;
  errors: number;
  startTime: number;
};

const QWERTY_LAYOUT = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

const INITIAL_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l'];
const MIN_KEYS_FOR_PROGRESSION = 8;
const PROGRESSION_THRESHOLD = 0.95;

const BEGINNER_WORDS = ['asa', 'sad', 'lad', 'fall', 'ask', 'dash', 'all', 'as', 'ad', 'fa', 'la', 'sa'];

const COMMON_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'are', 'was', 'were', 'been', 'being', 'have', 'has', 'had', 'having',
  'do', 'does', 'did', 'doing', 'will', 'would', 'should', 'could', 'may', 'might',
  'must', 'shall', 'can', 'cannot', 'ought', 'need', 'dare'
];

const INTERMEDIATE_WORDS = [
  'time', 'sound', 'thing', 'later', 'other', 'there', 'their', 'these', 'those', 'where',
  'world', 'important', 'different', 'example', 'problem', 'question', 'answer', 'change',
  'number', 'person', 'place', 'point', 'right', 'left', 'small', 'large', 'long', 'short',
  'high', 'low', 'old', 'new', 'young', 'good', 'bad', 'great', 'little', 'much',
  'many', 'more', 'most', 'less', 'least', 'same', 'such', 'very', 'too', 'also',
  'still', 'yet', 'already', 'again', 'always', 'never', 'often', 'sometimes', 'usually',
  'today', 'yesterday', 'tomorrow', 'now', 'then', 'here', 'there', 'where', 'when', 'why',
  'how', 'what', 'which', 'who', 'whose', 'whom', 'this', 'that', 'these', 'those'
];

const ADVANCED_WORDS = [
  'development', 'practice', 'accuracy', 'performance', 'challenge', 'improvement',
  'experience', 'knowledge', 'education', 'information', 'technology', 'computer',
  'internet', 'software', 'hardware', 'system', 'process', 'method', 'approach',
  'solution', 'problem', 'difficulty', 'challenge', 'opportunity', 'possibility',
  'important', 'necessary', 'essential', 'significant', 'effective', 'efficient',
  'successful', 'professional', 'personal', 'individual', 'collective', 'social',
  'economic', 'political', 'cultural', 'historical', 'scientific', 'technical',
  'academic', 'practical', 'theoretical', 'conceptual', 'physical', 'mental',
  'emotional', 'spiritual', 'intellectual', 'creative', 'innovative', 'original'
];

const SENTENCES = [
  'The quick brown fox jumps over the lazy dog.',
  'Practice makes perfect when learning to type.',
  'Typing speed and accuracy improve with consistent practice.',
  'Focus on accuracy first, then work on increasing your speed.',
  'The best way to learn is through regular practice sessions.',
  'Technology has changed how we communicate and work.',
  'Reading helps expand vocabulary and improve writing skills.',
  'Learning new skills requires patience and dedication.',
  'Success comes from hard work and perseverance.',
  'The internet provides access to vast amounts of information.',
  'Education is the foundation of personal and professional growth.',
  'Communication is essential for building strong relationships.',
  'Time management is crucial for productivity and success.',
  'Health and wellness should be priorities in our daily lives.',
  'Creativity and innovation drive progress in many fields.',
  'Understanding different perspectives helps us grow as individuals.',
  'The world is full of opportunities for those who seek them.',
  'Knowledge is power when applied with wisdom and care.',
  'Every challenge presents an opportunity to learn and improve.',
  'The future belongs to those who prepare for it today.',
  'I agree with you. That sounds like a good idea.',
  'I think you\'re right about that.',
  'I\'m not so sure about that, though.',
  'I disagree with your opinion on this matter.',
  'I see your point, but I have a different opinion.',
  'That makes sense to me.',
  'I think we both have valid points.',
  'I\'m sorry for being late to our meeting.',
  'Please forgive me for forgetting your birthday.',
  'I apologize for my mistake.',
  'I\'m so sorry for any inconvenience I caused.',
  'I didn\'t mean to hurt your feelings; I\'m really sorry.',
  'I want to say sorry for the misunderstanding.',
  'I deeply regret my actions, and I\'m genuinely sorry.',
  'Can you please help me with this problem?',
  'I\'m having trouble; could you give me a hand?',
  'I don\'t understand this; can you explain it to me?',
  'Could you assist me with this task?',
  'I need your guidance; can you help me out?',
  'Can you please show me how to do this?',
  'I\'m stuck on this project; can you offer some advice?',
  'I\'d like to order the chicken sandwich, please.',
  'Can we get a table for two, please?',
  'What do you recommend from the menu?',
  'May I have a glass of water, please?',
  'Could you bring the bill, please?',
  'This meal is delicious; I\'m enjoying it.',
  'Can I have a knife and fork, please?',
  'I like watching action movies and listening to pop music.',
  'I usually read mystery novels in my free time.',
  'Romantic comedies make me laugh.',
  'I enjoy watching cartoons at the weekend.',
  'I listen to my favourite songs on the radio.',
  'Science fiction movies are fascinating to me.',
  'I often read magazines for entertainment.',
  'Recycling is important to help the environment.',
  'I turn off lights when I leave a room to save energy.',
  'We should plant more trees to improve air quality.',
  'I try not to waste water when I\'m washing dishes.',
  'Pollution is a big problem in some cities.',
  'I use reusable bags when I go shopping.',
  'Global warming is a concern for our planet.',
  'My brother is my best friend; we do everything together.',
  'I love spending time with my cousins during the holidays.',
  'My parents mean the world to me.',
  'I have a close-knit group of friends from school.',
  'My sister and I share a room, and we get along well.',
  'I have a lot of fun playing games with my family.',
  'My best friend and I have known each other for years.',
  'I like to eat pizza and hamburgers.',
  'Cooking is not my strong suit, so I usually order takeout.',
  'I enjoy eating pasta with tomato sauce.',
  'I often have sandwiches for lunch.',
  'I prefer drinking tea over coffee.',
  'I sometimes make omelets for breakfast.',
  'My favourite dessert is chocolate ice cream.',
  'I\'ve been feeling a bit sick lately.',
  'It\'s important to eat healthy food.',
  'I need to see a doctor for a check-up.',
  'I have a headache; can you give me some advice?',
  'I\'m trying to get more exercise for my health.',
  'I\'ve been drinking lots of water to stay hydrated.',
  'I\'m taking medicine to feel better.',
  'I like reading books in my free time.',
  'Playing video games is my favourite hobby.',
  'I enjoy painting as a creative outlet.',
  'Gardening is a relaxing hobby for me.',
  'I often go fishing with my friends on weekends.',
  'I watch a lot of TV shows when I have spare time.',
  'My hobby is collecting stamps from different countries.',
  'Hi, I\'m Sarah. Nice to meet you!',
  'Hey, I\'m David. What\'s your name?',
  'Hi, I\'m Lisa. It\'s my first time here.',
  'Hello, I don\'t think we\'ve met before; I\'m Mark.',
  'Let me introduce myself; I\'m Emily.',
  'Hi, my name\'s Tom. Pleasure to meet you.',
  'Hello, I\'m Jessica. What\'s your name?',
  'Do you want to grab some lunch together?',
  'How about going out for pizza this weekend?',
  'I\'m planning to cook dinner tonight; would you like to join me?',
  'Let\'s have a picnic in the park; want to come along?',
  'Would you be interested in trying that new restaurant downtown?',
  'I\'m ordering takeout; do you want anything?',
  'Let\'s go to a café for some coffee and pastries.',
  'I\'m learning English to communicate with more people.',
  'English is a bit difficult for me, but I\'m trying my best.',
  'Can you suggest any websites for learning English online?',
  'Watching English movies with subtitles is helping me improve.',
  'I want to expand my vocabulary in English; any tips for that?',
  'English grammar can be confusing, but I\'m working on it.',
  'I practice my English with a language exchange partner.',
  'Can I schedule an appointment for a haircut on Friday?',
  'I need to set up a meeting with you. Can we find a time?',
  'Is it possible to arrange a doctor\'s appointment for next week?',
  'I\'d like to make a reservation for a table at your restaurant.',
  'Could we set a time for a job interview?',
  'Let\'s plan a meeting to discuss our project.',
  'I\'d like to book an appointment with the dentist.',
  'I enjoy spending time with my friends and family.',
  'I have a close-knit group of friends from school.',
  'I like to go on dates and meet new people.',
  'Communication is important in any relationship.',
  'I sometimes go to parties to socialize.',
  'I\'m in a long-distance relationship with my partner.',
  'I find it challenging to approach someone I\'m interested in.',
  'Well, I should get going now; take care!',
  'It\'s been nice talking to you. See you later!',
  'I\'ll talk to you soon; have a good day!',
  'Goodbye, and thanks for the chat!',
  'Until next time, farewell!',
  'It\'s time for me to leave; have a great evening!',
  'I\'ll be heading out now; see you around!',
  'Hello, how are you today?',
  'Hi there, nice to see you again.',
  'Hey, what\'s up?',
  'Good morning, how\'s it going?',
  'Hi, it\'s great to meet you.',
  'Hello, I don\'t think we\'ve met before.',
  'Hey, how have you been?',
  'Thanks a lot for your help; I really appreciate it.',
  'I want to say thank you for the lovely gift you gave me.',
  'Thanks for being there when I needed you.',
  'I\'m grateful for your support during this time.',
  'Your kind words meant a lot to me; thank you.',
  'Thanks for your assistance; I truly appreciate it.',
  'I just wanted to say thanks for your help.',
  'I\'m a student at the local high school.',
  'My favourite subject in school is science.',
  'I don\'t have much homework to do tonight.',
  'I\'m excited about the upcoming school trip.',
  'Math class is a bit challenging for me.',
  'I enjoy spending time with my friends at school.',
  'I\'m studying hard for my upcoming exams.',
  'I\'m going to the mall to buy some clothes.',
  'Can you help me find this item on my shopping list?',
  'I\'m looking for a birthday gift for my sister.',
  'These shoes are on sale; I\'ll take them.',
  'I need to pick up some groceries at the store.',
  'Do you think this shirt fits me well?',
  'I\'m browsing for a new smartphone.',
  'How\'s the weather today? It\'s quite nice.',
  'Have you seen any good movies lately?',
  'Do you have any plans for the weekend?',
  'I heard there\'s a new restaurant opening nearby.',
  'Have you tried the coffee at the cafe down the street?',
  'What\'s your favourite hobby or pastime?',
  'How\'s your day been so far?',
  'I just got a new smartphone; it\'s amazing.',
  'I use my computer for work and to stay connected with friends.',
  'Social media helps me keep in touch with family.',
  'I love playing video games on my console.',
  'Technology is advancing so quickly these days.',
  'I\'m trying to learn how to use this new app.',
  'Can you recommend a good website for tech news?',
  'I\'m planning a holiday at the seaside this summer.',
  'Have you been to any interesting places recently?',
  'I enjoy travelling and experiencing new cultures.',
  'I want to explore more countries in the future.',
  'Do you have any travel tips or recommendations?',
  'I\'m thinking about booking a flight for my next trip.',
  'I need to find a hotel for my upcoming holiday.',
  'It\'s really hot today. I can\'t wait for some rain.',
  'I love it when it\'s sunny outside; it puts me in a good mood.',
  'The weather forecast says it might snow tomorrow.',
  'I hope it doesn\'t rain during our outdoor plans.',
  'It\'s quite chilly; I need to wear a jacket.',
  'The weather has been unpredictable lately.',
  'I prefer warm and sunny days over cold ones.',
  'I work as a teacher at a local school.',
  'My job can be demanding, but I enjoy it.',
  'I have a meeting with my boss later today.',
  'I need to finish this report by the end of the week.',
  'I\'m looking for a new job in a different field.',
  'I\'m trying to balance work and family life.',
  'What do you do for a living?',
  'You always want to play games or get attention from me while I\'m studying or busy at work.',
  'I usually eat popcorns for a snack before my dinner.',
  'I normally go to work on foot.',
  'I frequently watch TV series.',
  'I sometimes read a book.',
  'Stop it, you are eating quickly.',
  'They are talking loudly when they know they are disturbing others.',
  'When will you call me to meet me?',
  'How long have you been drinking coffee? I thought you were just coming!',
  'How often do you come to this bookstore? I\'ve never seen you before!',
  'When did the exam start?',
  'When will you start reading?',
  'How long have you started studying? I thought we would start together when I arrived.',
  'Where do you usually prefer to spend the winter months?',
  'Where were you spending time?',
  'Where is the most popular soup place here?',
  'I occasionally drink alcohol because I care about my health.',
  'I seldom drink cola and soda.',
  'I hardly ever smoke, I smoke only if I drink alcohol.',
  'I never drink vodka, it tastes bad for me.',
  'When will you go on this trip?',
  'Where were you? I really waited for you!How much do I have to pay?',
  'How much is this book? I want to pay the fee immediately.',
  'How many of these glasses are there? I want to buy them all.',
  'How can you complete these activities so quickly?',
  'How did you get this far on foot? Congratulations!',
  'How do you drive the car? I have been having a hard time lately.',
  'How was your holiday so good?',
  'The man will definitely get the job done extremely quickly, so rest assured.',
  'The story would definitely end in the simplest way, Alice said, so we trusted you.',
  'We definitely knew you would come here these days.',
  'Stop it, you are eating extremely quickly.',
  'They are talking very loudly when they know they are disturbing others.',
  'He\'s certainly a very smart and sane man, you can trust him.',
  'I think I certainly can start a project with Alice since I have worked with Alice for so long',
  'You will certainly have a hard time doing this assignment, but the result will make you very happy.',
  'I struggled with this all day but it was certainly worth it.',
  'My teacher seems very nice.',
  'Where? They go everywhere together.',
  'They are happily married.',
  'This notebook is extremely fast.',
  'I think Martin will surely be there at the right time.',
  'Nowadays I\'m also very tired, I surely need a vacation.',
  'I got up late today too, but I\'ll surely still get all the work done.',
  'I return very tiredly after going to school, so I surely need to sleep today.',
  'When I go to a cyclist these days, the rider is always busy, I surely think it will be like this today.',
  'Recently announced data are undoubtedly extremely inaccurate.',
  'She\'s been this city since yesterday.',
  'Do you believe my father now?',
  'You undoubtedly should read this book to get results in the fastest way possible.',
  'When making coffee, you undoubtedly should put the coffee after the water, otherwise, the coffee grains may be boiled in the water.',
  'You undoubtedly need to take notes while reading this book, otherwise, it will be extremely difficult to understand.',
  'Eddie went to Layla\'s school yesterday.',
  'I am going to clean my kitchen tomorrow.',
  'His father lived in Paris for a year.',
  'I have been going to the same school since 2000.',
  'I eat vegetarian food, not meat.',
  'My cat waits impatiently for his food.',
  'She never drinks alcohol.',
  'You must always fasten your seat belt.',
  'I am going to go to a concert tomorrow.',
  'Now, I am going to go to school.',
  'I am going to go to school now.',
  'I am now going to go to school.',
  'I watched tv series all afternoon.',
  'I stayed at home for 3 nights.',
  'We went on holiday to Ibiza for three weeks.',
  'She spoke softly.',
  'My brother has been singing since he was a child.',
  'I have been falling for thirty minutes.',
  'I was only gone for a month.',
  'I have been in the same community since I was born.',
  'I have loved writing since kindergarten.',
  'I always eat vegetables.',
  'She often goes on vacation.',
  'He never cleans his own mess.',
  'The teacher is rarely late.',
  'My boss sometimes early leaves for work.',
  'I am still waiting for my star moment.',
  'Have you finish your dinner yet?',
  'I ate quickly for breakfast today.',
  'She has hardly survived this stage.',
  'I came home early in the morning.',
  'I\'ve been doing this homework for a week.',
  'I always go to visit my grandma.',
  'They ask hard questions in the exam.',
  'I overcome this problem very hardly.',
  'They saw things differently.',
  'You should discuss this clearly with the boss.',
  'Everyone always speaks well of Mark.',
  'She usually fed her cat cheap cat food.',
  'A sentence normally has a subject and a verb.',
  'I used to often take walks along that road.',
  'Married people sometimes wish they were single.',
  'I occasionally eat meat.',
  'My father seldom watches TV at night.',
  'He rarely makes a mistake.',
  'I never forget a face.',
  'I thought the movie ended abruptly.',
  'She talks loudly.',
  'Shall he not come in?',
  'Shall we not eat dinner here?',
  'Do not smoke in your room.',
  'You wash your hand first and then eat.',
  'Clean your room.',
  'Stop talking and open your book.',
  'Take the dog for a walk, please.',
  'Stop biting your fingernails.',
  'Nobody move!',
  'Do not walk fastly.',
  'Please be quiet in the library.',
  'Share wishes for someone.',
  'Do your chores!',
  'Enjoy some fresh strawberries.',
  'Stop talking!',
  'Have courage.',
  'Let no one of you speak.',
  'Switch off your mobiles.',
  'Do not talk to me like that.',
  'Do not make that sound.',
  'My mother has been watching TV all afternoon.',
  'They have been watching the Lord of the Kings.',
  'My grandmother has been still eating her breakfast.',
  'Children have been playing computer games in the lounge for two hours.',
  'They haven\'t been studying their books for six days.',
  'Has he been playing computer game since Monday?',
  'I have been travelling to this country for four days.',
  'The mechanic has not been repairing our refrigerator.',
  'Your eyes are wet. Have you been cutting onions?',
  'Has they been playing since morning?',
  'Chocolate is a dessert loved by women.',
  'The black car has been washed by him.',
  'The theory of relativity was developed by Einstein.',
  'New workers will be hired by the company.',
  'The letters must be delivered.',
  'How many movies did you watch this month?',
  'How far is it between the school and the house?',
  'Should I call or email you?',
  'Why are so scared of me?',
  'Who fixed the computer?',
  'How many times do you smoke?',
  'Who knows the answers to these questions?',
  'Whom did you see yesterday?',
  'Why are you not interested?',
  'Whose pants are these?',
  'A brownie is being baked by Michael.',
  'The Mona Lisa was painted by Leonardo Da Vinci.',
  'A mistake was made.',
  'He is being hired to work at Burger King.',
  'Most of the apples would be eaten before we got to the table.',
  'They don\'t live near here.',
  'I\'m sorry but this is not mine.',
  'I do not love you anymore.',
  'I will not go to school today.',
  'I didn\'t see him today.',
  'The meal is not ready.',
  'This old man was not actually right.',
  'She does not loves to play piano.',
  'Mary did not win the match.',
  'Today we will watch TV.',
  'There was no peach orchard on site of this building.',
  'He does not catches the bus every morning.',
  'Alex isn\'t telling the truth.',
  'I don\'t want too drink too much.',
  'He couldn\'t get unhealthy food.',
  'We don\'t have a house.',
  'Alex won\'t be coming to the movies. He is very busy.',
  'You are not lazy students.',
  'I don\'t take the trash out.',
  'He didn\'t get a passing grade because he didn\'t work hard enough.',
  'It does not do to dwell on dreams and forget to live.',
  'You don\'t teach your cat tricks.',
  'This is mine dog.',
  'You are not an engineer.',
  'The dog cannot walk itself.',
  'I will not love you.',
  'The coat I gave him couldn\'t fit on it.',
  'My father did not even bother to answer me.',
  'There is no play with fire.',
  'I will not have dinner tonight.',
  'She won\'t go to the cinema.',
  'There was not a single person outside.',
  'It wasn\'t me knocking on your door.',
  'The bag on the table is not his.',
  'I can\'t come home early today.',
  'Mary hasn\'t cooked some cookies.',
  'I have not failed.',
  'There was no one outside.',
  'I don\'t play volleyball.',
  'I don\'t want to marry her.',
  'No one has ever called us to complain.',
  'She wasn\'t eating white rice.',
  'The streets were not crowded today.',
  'You should not go take it from him.',
  'That man does not the same thing every day.',
  'I don\'t play tennis every day.',
  'I don\'t want to eat with him.',
  'My father didn\'t go to work in the morning.',
  'I don\'t learn English with my friends.',
  'I don\'t have my wallet with me.',
  'Although the weather was very hot, he wore coats and sweaters.',
  'If you work hard, you will be successful too.',
  'I ran into a big problem when I least expected it.',
  'My aunt\'s library had many books to count.',
  'He had some psychological problems that could not be treated with medication.',
  'I quit my job and came to Los Angeles for you.',
  'I value you and my family very much.',
  'Can you hand me the pen?',
  'If they like, I can carry some bags for you.',
  'My baby brother should be asleep by now.',
  'He could play football well when he was a kid.',
  'He could have taken the flight.',
  'We may have passed the math exam, but it was in Spanish.',
  'You might have sold the car., if you really needed the Money.',
  'You should have listened to the teacher.',
  'We must have been crazy!',
  'He shouldn\'t have told the.',
  'He has a cat and his cat breed is Scottish Fold.',
  'I accidentally broke my mom\'s favorite vase.',
  'It was spilled wine on my favorite sweater by my sister.',
  'They would go to the movies if you are interested.',
  'If I had a car, I would drive around the world.',
  'I could barely walk when I was a baby.',
  'Could you ever excited when you took the exams?',
  'I couldn\'t draw pictures in high school.',
  'If you can speak more than two languages, you will see that you find a job easily.',
  'If you\'d come with me, we could have had fun.',
  'I could help you with Spanish.',
  'Could I borrow your notebook?',
  'Would you like a cup of tea?',
  'You should go to the hospital tomorrow or you will be more sick.',
  'Her lessons are so bad, you should definitely take private lessons.',
  'You should study by taking notes, it becomes more memorable.',
  'You should watch the movie I told you in the morning, it will improve you a lot.',
  'You should to walk to work.',
  'You should save some money.',
  'You should do more exercise.',
  'I think we should wait for her now.',
  'May I ask a question?',
  'Would you like some help?',
  'You should take a break and get some rest.',
  'I may get bad grades in exams, I\'m not sure of any.',
  'I can swim every Tuesday.',
  'The roads snowed all night on the rocks, watch out that your car may slide.',
  'They may have moved here two years ago.',
  'She may have heard everything you just said.',
  'I bought myself a thick coat in case it may be very rainy this winter.',
  'I told him all the facts that it may upset him that I lied.',
  'May I leave early today?',
  'I may take you to work if you want.',
  'There\'s no chair to sit anywhere, May I sit next to you?',
  'I can speak three languages.',
  'Tomorrow I will be in New York.',
  'He should waits.',
  'I can speak English',
  'You can drink my tea and read my book then.',
  'I can meet you tomorrow.',
  'She is old. She can\'t play tennis.',
  'Can I ask a question?',
  'I knew I would win college this year.',
  'When I was 6, I could ride a bike.',
  'We couldn\'t go out.',
  'I will take these books with me.',
  'What could they draw? They could draw a horse.',
  'I might see her in the evening.',
  'The doctor said that I might released when I feel well.',
  'The director said that when you feel ready, you might on the stage.',
  'I wished you might passed the exams.',
  'I wished I might go abroad.',
  'I hoped you might not leave me.',
  'I want to be a computer engineer.',
  'He likes to paint by himself.',
  'I can run faster than him.',
  'I\'m not sure about the universe.',
  'I lost my watch yesterday.',
  'It wasn\'t me who knocked on your door.',
  'Everything was ready for the party.',
  'No one will come after me.',
  'She likes to paint by herself.',
  'We went fishing after school.',
  'You are very lazy.',
  'I would like to help you.',
  'I will get myself a coffee.',
  'I will not take it from you.',
  'He does not goes to gym every day.',
  'He is my best friend.',
  'I learnt English by myself.',
  'They killed him.',
  'My mom likes to paint by herself.',
  'You will not come with me.',
  'I really need someone.',
  'This was a threat to us.',
  'I told my father that I wanted to go to London.',
  'Brasil is not a country in Europe.',
  'She learned to read by herself.',
  'These are for you.',
  'I want to do something.',
  'They speak English in USA.',
  'I love you.',
  'She cook for you.',
  'The dogs belong to them.',
  'We borrowed her car.',
  'She is a mechanical engineer.',
  'I will take it from you.',
  'My father wouldn\'t let us buy a new computer.',
  'They are the smartest kids here.',
  'I have got a sister.',
  'I lost my wallet last week.',
  'Today we will come.',
  'I will help you.',
  'No one attended the parent meeting.',
  'Some people won\'t eat spicy foods.',
  'I bought a new house.',
  'I play volleyball.',
  'You are lazy students.',
  'My father will not come with us today.',
  'They live near here.',
  'They sleep in the afternoon.',
  'We don\'t work very hard.',
  'This was not a threat to us.',
  'I came to see you yesterday.',
  'You should take care of yourself.',
  'It bites everyone.',
  'I love dogs.',
  'She is not my best friend.',
  'I bought a new computer.',
  'Someone knows where he is.',
  'Everybody loves Mary.',
  'My son didn\'t eat yesterday.',
  'I hear nothing.',
  'She is my best friend.',
  'My father will come with us today.',
  'I don\'t want to play football with you.',
  'Mary and Alex invited them to the party.',
  'We can go on vacation with you.',
  'I didn\'t see you at school today.',
  'It won\'t rain tomorrow.',
  'You need to go take yours.',
  'We go to the gym club together.',
  'He hasn\'t come home.',
  'Madrid is not cold in this season.',
  'He would do anything.',
  'Someone knows where she is.',
  'There are 2 pineapples left on the table.',
  'I don\'t hear nothing.',
  'This is mine.',
  'The dog can walk itself.',
  'They will come after you.',
  'You were the boss.',
  'There were 3 apples on the table.',
  'I don\'t love you so much.',
  'My brother didn\'t come home.',
  'My father ate yesterday.',
  'They are not from Spain.',
  'We\'re not coming to you tomorrow.',
  'You will come with me.',
  'My brother\'s car broke down yesterday.',
  'I\'ve lost my umbrella.',
  'No one believes them.',
  'She is the best football player in the team.',
  'He learned to read by himself.',
  'Let\'s go to the cinema today.',
  'The clouds were not blocking the sun\'s rays.',
  'My friend does not like to eat dumplings.',
  'The soldiers killed him.',
  'My mother ate yesterday.',
  'I don\'t want to hear this.',
  'He studies every night.',
  'Everything is ready for the birthday party.',
  'That isn\'t the way to London.',
  'Today they will come.',
  'I would like to marry you.',
  'You should treat her with more respect.',
  'Please grant me a loan.',
  'Don\'t forget.',
  'Shut the window, will you?',
  'Have a Coke and a smile.',
  'Never forget the person who values you.',
  'Don\'t forget to brush your teeth after eating.',
  'Stay amazing!',
  'Don\'t drive fast.',
  'Miss me when we are parted.',
  'Drive slowly.',
  'Don\'t sit there.',
  'Catch it.',
  'Turn left at that intersection.',
  'Play with intensity and courage.',
  'Do not use drugs after vaccination.',
  'Take a left at the first stop light.',
  'Don\'t speak to Sam.',
  'Don\'t talk too loud at school.',
  'Please join me for dinner.',
  'Teach him.',
  'Be quiet, sir!',
  'Don\'t go, please.',
  'Pour some sugar on me.',
  'Feel free to call me any time.',
  'Respect your elders.',
  'Alex, please turn out that light.',
  'Take your time or you\'ll lose it.',
  'Pay more attention to your car.',
  'Do not run away from the problems.',
  'Bring me a cup of coffee.',
  'Read a lot to improve your writing skill.',
  'Don\'t eat too much before bed.',
  'Open the package first.',
  'Preheat the oven to 150 degrees before baking the cake.',
  'Don\'t go out.',
  'Come to work later.',
  'Don\'t ever call me a loser.',
  'Do the laundry.',
  'Please bring back the book I gave you.',
  'Please, don\'t come in.',
  'Stop doing this to me.',
  'Consider vegetables over meat.',
  'Pay the fees by time.',
  'Please leave.',
  'To install Witcher 3 Game of The Year edition, download the steam desktop launcher.',
  'Watch your step before taking it.',
  'Wish me luck, baby. This exam is too important.',
  'Don\'t open your books.',
  'Do not give up.',
  'Don\'t ever touch my phone.',
  'Don\'t drink any water.',
  'Shall we not go out?',
  'Please don\'t write your name on paper.',
  'Shut up!',
  'Don\'t touch my phone.',
  'Don\'t come here, please.',
  'Stand up, Samuel.',
  'Give me a pen and a pencil.',
  'Give me a phone and a computer.',
  'Come to the club with us tonight.',
  'Please arrive at the meeting on time.',
  'Don\'t touch the hot stove.',
  'Wash your hands!',
  'Pull your car so we can go out too.',
  'Move your legs, there would be a little pain.',
  'Come with us to the movies later.',
  'Don\'t text me anymore.',
  'Don\'t come here.',
  'Drink milk at night before going to bed.',
  'Don\'t ever dare to use that word again.',
  'Please leave the door open!',
  'Don\'t open the window, please.',
  'Enjoy!',
  'Leave the package at the door.',
  'Don\'t talk to him.',
  'Kindly lower your voices.',
  'You there, pay attention!',
  'Don\'t come with us if you order your steak as well-done. It is lame.',
  'Do not run behind the bus.',
  'Drive your car carefully if the wild wind blows.',
  'Come talk to us!',
  'Eat well.',
  'Don\'t forget to do the homework I gave you.',
  'Stop overreacting.',
  'Please join us to talk.',
  'Consider the lily.',
  'Help me.',
  'Talk to me softly.',
  'Do not play with fire.',
  'Make sure you study all the topics before the exam.',
  'Steep turn, go slow!',
  'Ring the bell.',
  'Enjoy this delicious meal.',
  'Don\'t move!',
  'Maintain silence!',
  'Watch your step!',
  'Give us the gate key.',
  'Do not behave like a dumb.',
  'High voltage! Do not touch!',
  'How beautiful this city is!',
  'He is such a kind person!',
  'But don\'t forget what I said!',
  'You are such a liar!',
  'What a cute squirrel cub!',
  'What an idea!',
  'Hurray, we won the match!',
  'What a wonderful gift!',
  'What a bad man he is!',
  'I\'m so angry right now!',
  'What a rude girl she is!',
  'How much my flowers grew in the sunlight!',
  'What a colorful bird it is!',
  'You did a great job!',
  'Emily\'s car was so amazing!',
  'How fast did you speak!',
  'I have a great idea!',
  'I love you!',
  'I did it!',
  'Wait, that bridge is rotten!',
  'Stay there, don\'t come here!',
  'What a cute child!',
  'Let the stone fall on me!',
  'I\'m so mad at her!',
  'Please, help me now!',
  'Off, what does this kid eat and drink there?',
  'Your kitten is such a sweetie!',
  'Egh, this cake is so ugly!',
  'Wow, he doesn\'t know much!',
  'I saw my favorite movie!',
  'I hate you!',
  'We won!',
  'Excellent!',
  'This is such an amazing meal!',
  'What a good dog!',
  'Here he comes!',
  'Hey!',
  'Come here Ella, quick!',
  'Caution, the soil may slip!',
  'What a shame!',
  'Oh, my God, would you stop by here!',
  'Ooo, are you here!',
  'Oh, I was going to be there now!',
  'Wow, I like you!',
  'How interesting he is!',
  'That birthday girl was so beautiful!',
  'Oh No! He is not coming to the party!',
  'Sara, wipe the board!',
  'There is a snake in the backyard!',
  'I will tell her where her boyfriend is if I see her.',
  'I will buy a house in the game if I have enough game money.',
  'Can you write a message to me if you see Alexander?',
  'You will pass your exams if you study enough.',
  'Could I go to the park?',
  'They could go to the movies if you are interested.',
  'I could visit many places if I had more money.',
  'A lot of crime could be prevented.',
  'You could have called first.',
  'If he calls you, you should go.',
  'If you don\'t hurry, you will miss the train.',
  'If you feel bad, you must go to the doctor.',
  'Could I speak to Mary?',
  'I can speak five languages.',
  'Alcohol can cause cancer.',
  'Can I come with you?',
  'Can I use your computer, please?',
  'You needn\'t have bought it, because I have already.',
  'You ought to have warned me earlier.',
  'Will you lend me your camera?',
  'I would play the tennis when I was a child.',
  'How about going to the circus tonight? It would so funny.',
  'We are going to breakfast. Would you come? Yes, I would.',
  'Would be used when making a wish.',
  'Could I have some tea, please?',
  'If I were you, I would say sorry.',
  'If you ate less, you would be weaker.',
  'Would you hand me the pencil?',
  'You should try some of this spaghetti.',
  'Might I read your magazine a little bit?',
  'You might send your gifts for Christmas early.',
  'If the doctor is inside, might I enter?',
  'I could play a guitar when I was a child.',
  'I could smell something burning.',
  'Would you help me?',
  'I would help you with Spanish.'
];

type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'sentences';

const DIFFICULTY_CONFIGS: Record<DifficultyLevel, {
  initialKeys: string[];
  wordPool: string[];
  realWordsThreshold: { accuracy: number; wpm: number };
  wordsPerLine: number;
  useSentences: boolean;
}> = {
  beginner: {
    initialKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l'],
    wordPool: BEGINNER_WORDS,
    realWordsThreshold: { accuracy: 0.90, wpm: 30 },
    wordsPerLine: 6,
    useSentences: false,
  },
  intermediate: {
    initialKeys: ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    wordPool: [...BEGINNER_WORDS, ...COMMON_WORDS, ...INTERMEDIATE_WORDS],
    realWordsThreshold: { accuracy: 0.92, wpm: 35 },
    wordsPerLine: 8,
    useSentences: false,
  },
  advanced: {
    initialKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    wordPool: [...COMMON_WORDS, ...INTERMEDIATE_WORDS, ...ADVANCED_WORDS],
    realWordsThreshold: { accuracy: 0.95, wpm: 40 },
    wordsPerLine: 10,
    useSentences: true,
  },
  expert: {
    initialKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    wordPool: [...COMMON_WORDS, ...INTERMEDIATE_WORDS, ...ADVANCED_WORDS],
    realWordsThreshold: { accuracy: 0.98, wpm: 50 },
    wordsPerLine: 12,
    useSentences: true,
  },
  sentences: {
    initialKeys: 'abcdefghijklmnopqrstuvwxyz'.split(''),
    wordPool: [...COMMON_WORDS, ...INTERMEDIATE_WORDS, ...ADVANCED_WORDS],
    realWordsThreshold: { accuracy: 0.95, wpm: 40 },
    wordsPerLine: 1,
    useSentences: true,
  },
};

const VOWELS = ['a', 'e', 'i', 'o', 'u'];

const calculateKeyDifficulty = (stat: KeyStats | undefined): number => {
  if (!stat || stat.attempts === 0) return 1;
  const avgDelayMs = stat.delays.length > 0
    ? stat.delays.reduce((a, b) => a + b, 0) / stat.delays.length
    : 0;
  const errorRate = stat.errors / stat.attempts;
  return errorRate * 0.7 + (avgDelayMs / 500) * 0.3;
};

const allowedWord = (word: string, allowedChars: Set<string>): boolean => {
  return Array.from(word.toLowerCase()).every(c => allowedChars.has(c) || c === ' ');
};

const generatePseudoWord = (
  keyStats: Map<string, KeyStats>,
  availableKeys: Set<string>,
  length: number = 4
): string => {
  const keys = Array.from(availableKeys);
  if (keys.length === 0) return '';

  const weightedChars = keys.flatMap(c => {
    const stat = keyStats.get(c);
    const weight = Math.ceil(calculateKeyDifficulty(stat) * 10);
    return Array(weight).fill(c);
  });

  const consonants = weightedChars.filter(c => !VOWELS.includes(c));
  const vowels = weightedChars.filter(c => VOWELS.includes(c));

  if (consonants.length === 0 || vowels.length === 0) {
    return weightedChars[Math.floor(Math.random() * weightedChars.length)] || '';
  }

  let word = '';
  for (let i = 0; i < length; i++) {
    const pool = i % 2 === 0 ? consonants : vowels;
    if (pool.length > 0) {
      word += pool[Math.floor(Math.random() * pool.length)];
    }
  }
  return word;
};

const allowedSentence = (sentence: string, allowedChars: Set<string>): boolean => {
  const lowerSentence = sentence.toLowerCase();
  for (let i = 0; i < lowerSentence.length; i++) {
    const c = lowerSentence[i];
    if (!allowedChars.has(c) && c !== ' ' && c !== '.' && c !== ',' && c !== "'" && c !== '-') {
      return false;
    }
  }
  return true;
};

const generateLine = (
  keyStats: Map<string, KeyStats>,
  keyPairStats: KeyPairStats,
  availableKeys: Set<string>,
  useRealWords: boolean,
  words: number = 8,
  wordPool: string[] = [],
  useSentences: boolean = false
): string => {
  const keys = Array.from(availableKeys);
  if (keys.length === 0) return '';

  const shouldUseRealWords = useRealWords && availableKeys.size >= 10;
  const isSentenceOnlyMode = words === 1 && useSentences;

  if (useSentences && availableKeys.size >= 20) {
    const sentenceChance = isSentenceOnlyMode ? 1.0 : (shouldUseRealWords ? 0.7 : 0.5);
    if (Math.random() < sentenceChance) {
      const filteredSentences = SENTENCES.filter(s => allowedSentence(s, availableKeys));
      if (filteredSentences.length > 0) {
        const selectedSentence = filteredSentences[Math.floor(Math.random() * filteredSentences.length)];
        
        const weakKeys = Array.from(keyStats.entries())
          .filter(([_, stat]) => stat.attempts > 5 && calculateKeyDifficulty(stat) > 0.15)
          .map(([key]) => key);

        if (weakKeys.length > 0 && !isSentenceOnlyMode) {
          const matchingSentences = filteredSentences.filter(s => {
            const lower = s.toLowerCase();
            return weakKeys.some(key => lower.includes(key));
          });
          if (matchingSentences.length > 0) {
            return matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
          }
        }

        return selectedSentence;
      }
    }
  }

  if (isSentenceOnlyMode) {
    const filteredSentences = SENTENCES.filter(s => allowedSentence(s, availableKeys));
    if (filteredSentences.length > 0) {
      const weakKeys = Array.from(keyStats.entries())
        .filter(([_, stat]) => stat.attempts > 5 && calculateKeyDifficulty(stat) > 0.15)
        .map(([key]) => key);

      if (weakKeys.length > 0) {
        const matchingSentences = filteredSentences.filter(s => {
          const lower = s.toLowerCase();
          return weakKeys.some(key => lower.includes(key));
        });
        if (matchingSentences.length > 0) {
          return matchingSentences[Math.floor(Math.random() * matchingSentences.length)];
        }
      }

      return filteredSentences[Math.floor(Math.random() * filteredSentences.length)];
    }
  }

  let filteredWordPool: string[] = [];
  if (shouldUseRealWords) {
    const poolToUse = wordPool.length > 0 ? wordPool : [...COMMON_WORDS, ...INTERMEDIATE_WORDS, ...ADVANCED_WORDS];
    filteredWordPool = poolToUse.filter(w => allowedWord(w, availableKeys));
  }

  const lineWords: string[] = [];

  for (let i = 0; i < words; i++) {
    if (shouldUseRealWords && filteredWordPool.length > 0 && Math.random() < 0.8) {
      const weakKeys = Array.from(keyStats.entries())
        .filter(([_, stat]) => stat.attempts > 5 && calculateKeyDifficulty(stat) > 0.15)
        .map(([key]) => key);

      if (weakKeys.length > 0 && Math.random() < 0.5) {
        const weakKey = weakKeys[Math.floor(Math.random() * weakKeys.length)];
        const matchingWords = filteredWordPool.filter(w => w.includes(weakKey));
        if (matchingWords.length > 0) {
          lineWords.push(matchingWords[Math.floor(Math.random() * matchingWords.length)]);
          continue;
        }
      }

      const digraphs = Object.entries(keyPairStats)
        .filter(([_, stat]) => {
          const total = stat.errors + stat.hits;
          return total > 3 && stat.errors / total > 0.15;
        })
        .map(([pair]) => pair);

      if (digraphs.length > 0 && Math.random() < 0.4) {
        const digraph = digraphs[Math.floor(Math.random() * digraphs.length)];
        const matchingWords = filteredWordPool.filter(w => w.includes(digraph));
        if (matchingWords.length > 0) {
          lineWords.push(matchingWords[Math.floor(Math.random() * matchingWords.length)]);
          continue;
        }
      }

      lineWords.push(filteredWordPool[Math.floor(Math.random() * filteredWordPool.length)]);
    } else {
      const wordLength = 3 + Math.floor(Math.random() * 3);
      const pseudoWord = generatePseudoWord(keyStats, availableKeys, wordLength);
      if (pseudoWord) {
        lineWords.push(pseudoWord);
      } else {
        const fallbackKey = keys[Math.floor(Math.random() * keys.length)];
        lineWords.push(fallbackKey.repeat(3));
      }
    }
  }

  return lineWords.join(' ');
};

const TypingPracticeScreen: React.FC = () => {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [keyStats, setKeyStats] = useState<Map<string, KeyStats>>(new Map());
  const [keyPairStats, setKeyPairStats] = useState<KeyPairStats>({});
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [availableKeys, setAvailableKeys] = useState<Set<string>>(new Set(INITIAL_KEYS));
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    wpm: [],
    accuracy: [],
    totalChars: 0,
    correctChars: 0,
    errors: 0,
    startTime: 0,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const statsRef = useRef({ totalChars: 0, correctChars: 0 });
  const initializedRef = useRef(false);
  const lastKeyPressTime = useRef<number>(0);
  const [useRealWords, setUseRealWords] = useState(false);
  const textGeneratedRef = useRef(false);
  const startingSessionRef = useRef(false);

  const updateKeyStats = useCallback((key: string, isError: boolean, delayMs: number) => {
    setKeyStats(prev => {
      const newStats = new Map(prev);
      const stats = newStats.get(key) || {
        errors: 0,
        hits: 0,
        attempts: 0,
        lastErrorTime: 0,
        delays: [],
      };
      stats.attempts++;
      if (isError) {
        stats.errors++;
        stats.lastErrorTime = Date.now();
      } else {
        stats.hits++;
        if (delayMs > 0) {
          stats.delays.push(delayMs);
          if (stats.delays.length > 50) {
            stats.delays.shift();
          }
        }
      }
      newStats.set(key, stats);
      return newStats;
    });
  }, []);

  const updateKeyPairStats = useCallback((pair: string, isError: boolean) => {
    setKeyPairStats(prev => {
      const updated = { ...prev };
      if (!updated[pair]) {
        updated[pair] = { errors: 0, hits: 0 };
      }
      if (isError) {
        updated[pair].errors++;
      } else {
        updated[pair].hits++;
      }
      return updated;
    });
  }, []);

  const checkProgression = useCallback(() => {
    const keys = Array.from(availableKeys);
    let allKeysGood = true;

    for (const key of keys) {
      const stats = keyStats.get(key);
      if (!stats) {
        allKeysGood = false;
        break;
      }
      if (stats.attempts < 20) {
        allKeysGood = false;
        break;
      }
      const accuracy = stats.hits / stats.attempts;
      if (accuracy < PROGRESSION_THRESHOLD) {
        allKeysGood = false;
        break;
      }
    }

    if (allKeysGood && availableKeys.size < 26) {
      const allLetters = 'abcdefghijklmnopqrstuvwxyz'.split('');
      const newKey = allLetters.find(k => !availableKeys.has(k));
      if (newKey) {
        setAvailableKeys(prev => {
          const updated = new Set(Array.from(prev));
          updated.add(newKey);
          return updated;
        });
      }
    }
  }, [availableKeys, keyStats]);

  const startSession = useCallback(() => {
    if (isActive || startingSessionRef.current) return;
    
    startingSessionRef.current = true;
    setIsActive(true);
    setShowSummary(false);
    textGeneratedRef.current = true;
    
    const config = DIFFICULTY_CONFIGS[difficulty];
    const shouldUseRealWords = sessionStats.totalChars > 0 &&
      (sessionStats.correctChars / sessionStats.totalChars) >= config.realWordsThreshold.accuracy &&
      sessionStats.wpm.length > 0 &&
      sessionStats.wpm[sessionStats.wpm.length - 1] >= config.realWordsThreshold.wpm;

    setUseRealWords(shouldUseRealWords);

    const newText = generateLine(
      keyStats,
      keyPairStats,
      availableKeys,
      shouldUseRealWords,
      config.wordsPerLine,
      config.wordPool,
      config.useSentences
    );
    setText(newText);
    setUserInput('');
    setCurrentIndex(0);
    startTimeRef.current = Date.now();
    lastKeyPressTime.current = Date.now();
    statsRef.current = { totalChars: 0, correctChars: 0 };
    setSessionStats({
      wpm: [],
      accuracy: [],
      totalChars: 0,
      correctChars: 0,
      errors: 0,
      startTime: Date.now(),
    });

    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
    }

    wpmIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 60000;
      if (elapsed > 0 && statsRef.current.totalChars > 0) {
        const wpm = (statsRef.current.correctChars / 5) / elapsed;
        const accuracy = statsRef.current.totalChars > 0
          ? (statsRef.current.correctChars / statsRef.current.totalChars) * 100
          : 100;

        setSessionStats(prev => ({
          ...prev,
          wpm: [...prev.wpm, wpm],
          accuracy: [...prev.accuracy, accuracy],
        }));

        const shouldUseRealWords = accuracy > 95 && wpm > 40;
        setUseRealWords(shouldUseRealWords);
      }
    }, 1000);
    
    setTimeout(() => {
      startingSessionRef.current = false;
    }, 100);
  }, [keyStats, keyPairStats, availableKeys, difficulty, isActive]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement> | KeyboardEvent) => {
    if (!isActive && !showSummary && !startingSessionRef.current && e.key.length === 1 && e.key !== ' ') {
      e.preventDefault();
      startSession();
      return;
    }

    if (!isActive) return;

    if (e.key === 'Backspace') {
      if (currentIndex > 0) {
        setCurrentIndex(prev => prev - 1);
        setUserInput(prev => prev.slice(0, -1));
      }
      return;
    }

    if (e.key.length !== 1) return;

    const now = Date.now();
    const delayMs = lastKeyPressTime.current > 0 ? now - lastKeyPressTime.current : 0;
    lastKeyPressTime.current = now;

    const expectedChar = text[currentIndex];
    const typedChar = e.key;
    const isCorrect = expectedChar === typedChar;

    setPressedKey(typedChar.toLowerCase());
    setTimeout(() => setPressedKey(null), 150);

    if (isCorrect) {
      setCurrentIndex(prev => prev + 1);
      setUserInput(prev => prev + typedChar);
      updateKeyStats(typedChar.toLowerCase(), false, delayMs);
      statsRef.current.totalChars++;
      statsRef.current.correctChars++;
      setSessionStats(prev => ({
        ...prev,
        totalChars: prev.totalChars + 1,
        correctChars: prev.correctChars + 1,
      }));

      if (currentIndex > 0) {
        const pair = text[currentIndex - 1].toLowerCase() + typedChar.toLowerCase();
        updateKeyPairStats(pair, false);
      }
    } else {
      updateKeyStats(typedChar.toLowerCase(), true, delayMs);
      statsRef.current.totalChars++;
      setSessionStats(prev => ({
        ...prev,
        totalChars: prev.totalChars + 1,
        errors: prev.errors + 1,
      }));

      if (currentIndex > 0) {
        const pair = text[currentIndex - 1].toLowerCase() + typedChar.toLowerCase();
        updateKeyPairStats(pair, true);
      }
    }

    if (currentIndex + 1 >= text.length) {
      setIsActive(false);
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current);
      }
      checkProgression();
      textGeneratedRef.current = false;
      startingSessionRef.current = false;
      setTimeout(() => setShowSummary(true), 500);
    }
  }, [isActive, text, currentIndex, startSession, updateKeyStats, updateKeyPairStats, checkProgression]);

  useEffect(() => {
    const handleGlobalKeyPress = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      handleKeyPress(e);
    };

    window.addEventListener('keydown', handleGlobalKeyPress);
    return () => window.removeEventListener('keydown', handleGlobalKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    const config = DIFFICULTY_CONFIGS[difficulty];
    setAvailableKeys(new Set(config.initialKeys));
    initializedRef.current = false;
    textGeneratedRef.current = false;
    startingSessionRef.current = false;
    setText('');
  }, [difficulty]);

  useEffect(() => {
    if (startingSessionRef.current || isActive || showSummary) return;
    
    if (!textGeneratedRef.current && availableKeys.size > 0 && !text) {
      setText('');
      initializedRef.current = true;
    }
  }, [availableKeys.size, difficulty, isActive, showSummary, text]);

  const getWeakKeys = (): Array<{ key: string; errorRate: number; difficulty: number }> => {
    const weak: Array<{ key: string; errorRate: number; difficulty: number }> = [];
    keyStats.forEach((stats, key) => {
      if (stats.attempts >= 5) {
        const errorRate = stats.errors / stats.attempts;
        const diff = calculateKeyDifficulty(stats);
        weak.push({ key, errorRate, difficulty: diff });
      }
    });
    return weak.sort((a, b) => b.difficulty - a.difficulty).slice(0, 5);
  };

  const getWeakPairs = (): Array<{ pair: string; errorRate: number }> => {
    const weak: Array<{ pair: string; errorRate: number }> = [];
    Object.entries(keyPairStats).forEach(([pair, stats]) => {
      const total = stats.errors + stats.hits;
      if (total >= 3) {
        const errorRate = stats.errors / total;
        weak.push({ pair, errorRate });
      }
    });
    return weak.sort((a, b) => b.errorRate - a.errorRate).slice(0, 5);
  };

  const currentWPM = sessionStats.wpm.length > 0
    ? Math.round(sessionStats.wpm[sessionStats.wpm.length - 1])
    : 0;
  const currentAccuracy = sessionStats.totalChars > 0
    ? Math.round((sessionStats.correctChars / sessionStats.totalChars) * 100)
    : 100;

  const renderCharacter = (char: string, index: number) => {
    if (index < currentIndex) {
      const isCorrect = userInput[index] === char;
      return (
        <span
          key={index}
          className={isCorrect ? 'text-emerald-400' : 'text-rose-400 bg-rose-400/20'}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    }
    if (index === currentIndex) {
      return (
        <span
          key={index}
          className="underline decoration-2 decoration-sky-400 text-sky-400 bg-sky-400/10"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      );
    }
    return (
      <span key={index} className="text-neutral-400">
        {char === ' ' ? '\u00A0' : char}
      </span>
    );
  };

  return (
    <div className="w-full flex-grow flex flex-col items-center justify-center animate-fade-in p-4 max-w-6xl mx-auto">
      <div className="w-full mb-6 flex justify-center items-center">
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center gap-4 shadow-lg">
          <label htmlFor="difficulty-select" className="text-sm font-semibold text-neutral-300 whitespace-nowrap">
            Difficulty Level:
          </label>
          <div className="relative">
            <select
              id="difficulty-select"
              value={difficulty}
              onChange={(e) => {
                const newDifficulty = e.target.value as DifficultyLevel;
                setDifficulty(newDifficulty);
                setIsActive(false);
                setShowSummary(false);
                setUserInput('');
                setCurrentIndex(0);
                setKeyStats(new Map());
                setKeyPairStats({});
                setSessionStats({
                  wpm: [],
                  accuracy: [],
                  totalChars: 0,
                  correctChars: 0,
                  errors: 0,
                  startTime: 0,
                });
              }}
              disabled={isActive}
              className="appearance-none bg-slate-800 border border-slate-600 text-sky-400 px-5 py-2.5 pr-10 rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 hover:bg-slate-750 hover:border-sky-500/50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800 disabled:hover:border-slate-600 shadow-sm min-w-[240px]"
            >
            <option value="beginner" className="bg-slate-800 text-sky-400">Beginner (Home row)</option>
            <option value="intermediate" className="bg-slate-800 text-sky-400">Intermediate (+ G, H)</option>
            <option value="advanced" className="bg-slate-800 text-sky-400">Advanced (All keys)</option>
            <option value="expert" className="bg-slate-800 text-sky-400">Expert (All keys, higher threshold)</option>
            <option value="sentences" className="bg-slate-800 text-sky-400">Sentences Only</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-sky-400 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-md border border-slate-700/50">
            <span className="text-xs text-neutral-400">Info:</span>
            <span className="text-xs font-medium text-sky-400">
              {difficulty === 'beginner' && '7 keys • 6 words/line'}
              {difficulty === 'intermediate' && '9 keys • 8 words/line'}
              {difficulty === 'advanced' && '26 keys • 10 words/line'}
              {difficulty === 'expert' && '26 keys • 12 words/line'}
              {difficulty === 'sentences' && '26 keys • Sentences only'}
            </span>
          </div>
        </div>
      </div>
      <div className="w-full mb-6 flex justify-between items-center gap-4">
        <div className="bg-slate-900 p-3 px-6 rounded-md text-center border border-slate-700">
          <div className="text-sm text-neutral-400">WPM</div>
          <div className="text-3xl font-bold text-sky-400">{currentWPM}</div>
        </div>
        <div className="bg-slate-900 p-3 px-6 rounded-md text-center border border-slate-700">
          <div className="text-sm text-neutral-400">Accuracy</div>
          <div className="text-3xl font-bold text-emerald-400">{currentAccuracy}%</div>
        </div>
        <div className="bg-slate-900 p-3 px-6 rounded-md text-center border border-slate-700">
          <div className="text-sm text-neutral-400">Errors</div>
          <div className="text-3xl font-bold text-rose-400">{sessionStats.errors}</div>
        </div>
      </div>

      <div className="w-full mb-6">
        {useRealWords && isActive && (
          <div className="text-sm text-emerald-400 mb-2 text-center">
            ✨ Real words mode enabled
          </div>
        )}
        <div className="bg-slate-900 p-8 rounded-lg border border-slate-700 min-h-[120px] flex items-center">
          {!text && !isActive ? (
            <div className="w-full text-center text-neutral-500 text-lg">
              Click "Start Typing" or press any key to begin
            </div>
          ) : (
            <div className="w-full text-2xl font-mono leading-relaxed break-words">
              {text.split('').map((char, index) => renderCharacter(char, index))}
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={() => {}}
          onKeyDown={handleKeyPress}
          className="sr-only"
          autoFocus
        />
      </div>

      <div className="w-full mb-6">
        <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
          <div className="text-sm text-neutral-400 mb-3">On-Screen Keyboard</div>
          <div className="space-y-2">
            {QWERTY_LAYOUT.map((row, rowIndex) => (
              <div key={rowIndex} className="flex justify-center gap-1">
                {rowIndex === 1 && <div className="w-6" />}
                {rowIndex === 2 && <div className="w-12" />}
                {row.map(key => {
                  const stats = keyStats.get(key);
                  const keyDifficulty = stats ? calculateKeyDifficulty(stats) : 0;
                  const isPressed = pressedKey === key;
                  const isAvailable = availableKeys.has(key);
                  const bgColor = isPressed
                    ? 'bg-sky-500'
                    : !isAvailable
                    ? 'bg-slate-800 opacity-50'
                    : keyDifficulty > 0.15
                    ? 'bg-rose-500/30'
                    : keyDifficulty > 0.08
                    ? 'bg-amber-500/20'
                    : 'bg-slate-800';

                  return (
                    <div
                      key={key}
                      className={`${bgColor} px-3 py-2 rounded text-sm font-mono border border-slate-700 transition-all ${
                        isPressed ? 'scale-110' : ''
                      }`}
                    >
                      {key}
                    </div>
                  );
                })}
                {rowIndex === 1 && <div className="w-6" />}
                {rowIndex === 2 && <div className="w-12" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {!isActive && !showSummary && (
        <button
          onClick={startSession}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-8 rounded-md transition-all duration-200 text-lg active:scale-95"
        >
          Start Typing
        </button>
      )}

      {showSummary && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-900 p-8 rounded-lg shadow-2xl border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Session Summary</h2>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="text-sm text-neutral-400 mb-1">Average WPM</div>
                <div className="text-2xl font-bold text-sky-400">
                  {sessionStats.wpm.length > 0
                    ? Math.round(sessionStats.wpm.reduce((a, b) => a + b, 0) / sessionStats.wpm.length)
                    : 0}
                </div>
              </div>
              <div className="bg-slate-800 p-4 rounded border border-slate-700">
                <div className="text-sm text-neutral-400 mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-emerald-400">
                  {sessionStats.totalChars > 0
                    ? Math.round((sessionStats.correctChars / sessionStats.totalChars) * 100)
                    : 100}%
                </div>
              </div>
            </div>

            {sessionStats.wpm.length > 1 && (
              <div className="mb-6">
                <div className="text-sm text-neutral-400 mb-2">WPM Over Time</div>
                <div className="bg-slate-800 p-4 rounded border border-slate-700 h-32 flex items-end gap-1">
                  {sessionStats.wpm.map((wpm, i) => {
                    const maxWpm = Math.max(...sessionStats.wpm, 1);
                    const height = (wpm / maxWpm) * 100;
                    return (
                      <div
                        key={i}
                        className="bg-sky-500 flex-1 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                        title={`${Math.round(wpm)} WPM`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mb-6">
              <div className="text-sm text-neutral-400 mb-2">Weak Keys (by difficulty)</div>
              <div className="bg-slate-800 p-4 rounded border border-slate-700">
                {getWeakKeys().length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {getWeakKeys().map(({ key, errorRate, difficulty }) => (
                      <div
                        key={key}
                        className="bg-rose-500/30 px-3 py-1 rounded text-sm font-mono border border-rose-500/50"
                        title={`Error rate: ${Math.round(errorRate * 100)}%, Difficulty: ${difficulty.toFixed(2)}`}
                      >
                        {key}: {Math.round(difficulty * 100)}%
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-neutral-500 text-sm">Not enough data yet</div>
                )}
              </div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-neutral-400 mb-2">Weak Key Pairs</div>
              <div className="bg-slate-800 p-4 rounded border border-slate-700">
                {getWeakPairs().length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {getWeakPairs().map(({ pair, errorRate }) => (
                      <div
                        key={pair}
                        className="bg-rose-500/30 px-3 py-1 rounded text-sm font-mono border border-rose-500/50"
                      >
                        {pair}: {Math.round(errorRate * 100)}%
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-neutral-500 text-sm">Not enough data yet</div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={startSession}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-6 rounded-md transition-all duration-200 active:scale-95"
              >
                Practice Again
              </button>
              <button
                onClick={() => {
                  setShowSummary(false);
                  setIsActive(false);
                }}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-neutral-200 font-bold py-3 px-6 rounded-md transition-all duration-200 active:scale-95"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TypingPracticeScreen;
