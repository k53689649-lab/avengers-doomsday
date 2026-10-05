/* =========================================================
   数据:全部漫威影视作品
   rel 字段:
   direct  = 直接相关(复联5前情关键)
   context = 重要背景(理解世界观必备)
   minor   = 补充/彩蛋级关联
   info    = 番外/无官方关联(标注说明)
   status: released (已上映) / upcoming (未上映/待映)
   ========================================================= */
var FILMS = [
  /* ================= 漫威影业 · 无限传奇 ================= */
  {
    id: "ironman", title: "钢铁侠", en: "Iron Man", year: 2008, studio: "漫威影业",
    group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "天才军火商托尼·斯塔克在阿富汗被绑架,从自制战甲中逃出生天,公开身份成为超级英雄钢铁侠。片尾彩蛋尼克·弗瑞一句'你只是加入一个更大的宇宙',正式点燃整个MCU。",
    relation: "一切的开端。托尼·斯塔克的遗产贯穿始终:终局之战中他牺牲自己打响响指;而如今扮演毁灭博士的正是小罗伯特·唐尼——看复联5时,'托尼的脸、杜姆的心'带来的情感冲击,全都建立在这部片上。"
  },
  {
    id: "hulk2008", title: "无敌浩克", en: "The Incredible Hulk", year: 2008, studio: "漫威影业(环球发行)", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "布鲁斯·班纳被军方追捕,与渴望力量的埃米尔·布朗斯基(憎恶)大战。罗斯将军是幕后推手。",
    relation: "罗斯将军后来成为国务卿、美国总统(美队4中变身红浩克),而美队4的复仇者政治格局正是复联5的前奏;憎恶也曾出现在女浩克剧集中。"
  },
  {
    id: "ironman2", title: "钢铁侠2", en: "Iron Man 2", year: 2010, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "托尼身中毒杀危机,击败鞭索伊万·万科;黑寡妇与神盾局登场,片尾彩蛋引出雷神之锤。",
    relation: "主要作用是铺垫神盾局与雷神宇宙,与复联5没有直接剧情连接,属于世界观补完。"
  },
  {
    id: "thor1", title: "雷神", en: "Thor", year: 2011, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "傲慢的阿斯加德王子索尔被父亲奥丁放逐地球,最终夺回雷神之力,与养兄弟洛基决裂——洛基坠落宇宙深渊。",
    relation: "洛基是多元宇宙乱局的源头人物之一(他和他杀死'遗留者'的举动直接催生了康之死与无限多元宇宙的失控)。看洛基剧集之前,这部是认识他的起点。"
  },
  {
    id: "cap1", title: "美国队长:复仇者先锋", en: "Captain America: The First Avenger", year: 2011, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "弱小的布鲁克林男孩史蒂夫·罗杰斯注射超级血清成为美国队长,对抗九头蛇红骷髅,冰封70年终被唤醒。",
    relation: "山姆·威尔逊(现役美队)的偶像原型与精神源头;红骷髅、九头蛇的势力线也一路延伸到美队4/复联5的世界格局。"
  },
  {
    id: "avengers1", title: "复仇者联盟", en: "The Avengers", year: 2012, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "洛基携奇塔瑞大军入侵纽约,钢铁侠、美队、雷神、绿巨人、黑寡妇、鹰眼首次集结,打响'复仇者集结'第一战。",
    relation: "'复仇者'从概念变成现实。复联5的口号再一次是'复仇者集结'——只不过这一次集结的是多元宇宙的复仇者。"
  },
  {
    id: "ironman3", title: "钢铁侠3", en: "Iron Man 3", year: 2013, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "恐怖分子'满大人'身份反转,基里安博士的绝境病毒制造大规模阴谋,托尼崩溃后重生。",
    relation: "托尼的心理创伤线(纽约之战焦虑症)与本片关联有限,是无限传奇的过渡集,对复联5影响很小。"
  },
  {
    id: "thor2", title: "雷神2:黑暗世界", en: "Thor: The Dark World", year: 2013, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "黑暗精灵玛勒基斯抢夺以太(现实宝石),洛基假死脱身,索尔守护九界。",
    relation: "以太→现实宝石→卡魔拉/灭霸(复联3)的宝石链条起点之一;对复联5属背景知识。"
  },
  {
    id: "cap2", title: "美国队长2:冬日战士", en: "Captain America: The Winter Soldier", year: 2014, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "神盾局被九头蛇渗透,史蒂夫发现挚友巴基被洗脑成'冬日战士',神盾局体制彻底瓦解。",
    relation: "冬兵是雷霆特工队的成员之一(该片2025年上映时为哨兵保驾护航);神盾局垮台也间接解释了为何如今复仇者是一支更松散、非政府的队伍。"
  },
  {
    id: "gotg1", title: "银河护卫队", en: "Guardians of the Galaxy", year: 2014, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "星际混混星爵与卡魔拉、火箭浣熊、格鲁特、毁灭者德拉克斯组成尬聊天团,阻止罗南用力量宝石毁灭山达尔。",
    relation: "开启宇宙线与无限宝石科普;片尾彩蛋霍华德鸭首次客串(把1986年那部老片变成官方彩蛋)。星爵据说可能在复联5回归(传闻未官宣)。"
  },
  {
    id: "avengers2", title: "复仇者联盟2:奥创纪元", en: "Avengers: Age of Ultron", year: 2015, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "托尼制造的AI奥创失控,欲毁灭人类;快银、绯红女巫登场,复仇者最终摧毁索科维亚。复仇者内部裂痕就此埋下。",
    relation: "索科维亚协议的伏笔、绯红女巫的能力本源;更重要的是'机器人灾难'与毁灭博士的'控制性毁灭'在主题上遥相呼应。"
  },
  {
    id: "antman1", title: "蚁人", en: "Ant-Man", year: 2015, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "小偷斯科特·朗穿上汉克·皮姆的战衣,掌握缩小进入量子领域的技能,成为蚁人。",
    relation: "量子领域第一次被正式引入——正是终局之战时间旅行、以及蚁人3(康)故事的关键钥匙,而康的时间线动乱是复联5原剧本'康之王朝'的根基。"
  },
  {
    id: "cap3", title: "美国队长3:内战", en: "Captain America: Civil War", year: 2016, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "复仇者因索科维亚协议分裂成两派,机场大战;冬日战士走上洗白道路,钢铁侠与美队决裂。",
    relation: "蜘蛛侠(荷兰弟)与黑豹在此登场,为后来的故事铺路;分裂的复仇者至今没有真正恢复'统一指挥',这解释了为何复联5需要重新集结。"
  },
  {
    id: "drstrange1", title: "奇异博士", en: "Doctor Strange", year: 2016, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "direct", status: "released",
    plot: "傲慢的外科医生斯特兰奇车祸废手,远赴卡玛泰姬修习至尊魔法,成为守护多元维度的奇异博士。",
    relation: "多元宇宙概念的教科书!永恒的时间宝石、镜像维度、'我们相信的世界并非真实'——复联5的多元宇宙大战全靠他的法系背景支撑。他本人也被预测为复联5关键角色(见预测区)。"
  },
  {
    id: "gotg2", title: "银河护卫队2", en: "Guardians of the Galaxy Vol. 2", year: 2017, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "星爵的生父'天神伊戈'其实是要吞噬宇宙的活体星球,小队用爱与爆炸解决了家庭问题。",
    relation: "与复联5关联较弱,但对'宇宙级的父权反派'主题有铺垫意味;螳螂女的催眠能力也是后话伏笔。"
  },
  {
    id: "smhc", title: "蜘蛛侠:英雄归来", en: "Spider-Man: Homecoming", year: 2017, studio: "漫威影业×索尼", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "高中生彼得·帕克在托尼的导师式护航下,打败秃鹫,证明自己配得上蜘蛛侠之名。",
    relation: "荷兰弟版蜘蛛侠是多元宇宙蜘蛛侠的锚点之一;彼得·帕克的身份危机与'拯救多元宇宙'的宿命,到英雄无归被推到顶点。"
  },
  {
    id: "thor3", title: "雷神3:诸神黄昏", en: "Thor: Ragnarok", year: 2017, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "索尔失去雷神之锤,与洛基、女武神对抗海拉,阿斯加德在苏尔特尔剑下毁灭。",
    relation: "阿斯加德难民线在此终结;洛基从'弟弟'走向'守护者'的转变,是洛基剧集自我救赎的前提。"
  },
  {
    id: "blackpanther1", title: "黑豹", en: "Black Panther", year: 2018, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "minor", status: "released",
    plot: "特查拉继承瓦坎达王位,击败堂弟克尔芒戈,向世界公开瓦坎达的科技与财富。",
    relation: "瓦坎达的科技与外交立场继续影响美队4与复联5时期的地球格局;苏睿的缺席与回归也牵动着多元宇宙的变数。"
  },
  {
    id: "iw", title: "复仇者联盟3:无限战争", en: "Avengers: Infinity War", year: 2018, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "灭霸集齐六颗无限宝石,一个响指抹去宇宙一半生命;奇异博士主动交出时间宝石,赌那唯一的1400万分之一的胜利。",
    relation: "无限传奇的高潮上半场,'1400万分之一'是多元宇宙概念的第一次大口径亮相——奇异博士看过的,也许至今仍藏着复联5的关键线索。"
  },
  {
    id: "amw", title: "蚁人与黄蜂女", en: "Ant-Man and the Wasp", year: 2018, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "斯科特在软禁中与霍普联手,试图从量子领域救回珍妮特·范·戴因,却意外解锁了时间漩涡。",
    relation: "珍妮特'被困量子领域30年'的设定,直接对应蚁人3中康的存在,而康的时间线野心正是复联5(原《康之王朝》)的底层逻辑。"
  },
  {
    id: "capmarvel1", title: "惊奇队长", en: "Captain Marvel", year: 2019, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "克里人战士'维尔'实为失忆的卡罗尔·丹弗斯,觉醒双星形态功力,成为宇宙级强者。",
    relation: "宇宙战力天花板之一。终局之战中她一度是'新复仇者'的带头大姐,复联5若需宇宙级火力,她是首选(见预测区)。"
  },
  {
    id: "endgame", title: "复仇者联盟4:终局之战", en: "Avengers: Endgame", year: 2019, studio: "漫威影业", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "direct", status: "released",
    plot: "五年后,幸存复仇者通过量子领域时间劫案夺回宝石,复活半数生命;钢铁侠以凡人之躯打响终局响指,寡姐献祭,美队退隐。",
    relation: "★《毁灭之日》的起点。托尼·斯塔克之死直接促成了'现在扮演毁灭博士的正是托尼的脸';美队带走美队盾牌造成遗留问题;终局战役也留下了无数'可能性分支'——这正是多元宇宙扩张的温床。2026年重映的《加码臻享版(伽马尊享版)》在原片结尾新增/替换了 4 个复联5彩蛋(见下一条目)。"
  },
  {
    id: "endgame2026", title: "复仇者联盟4:终局之战 · 加码臻享版(伽马尊享版)", en: "Avengers: Endgame — Re-Release Special Edition", year: 2026, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇(重映特别版)", rel: "direct", status: "released",
    plot: "2026年重映的加码版本:正片内容不变,但在结尾与片尾段落新增/替换了 4 个直接指向《复仇者联盟5:毁灭之日》的彩蛋——①史蒂夫·罗杰斯与佩姬·卡特跳舞时突然有人敲门,开门发现竟是洛基;②班纳在《蜘蛛侠4》的暴走事件后对自己进行自我封印,最终被毁灭博士'收集'带走;③TVA 发现三千个宇宙正在相撞;④原本关于钢铁侠的结尾彩蛋,被替换为毁灭博士亲手制作面具的过程。",
    relation: "★截至目前最新、也最直接的复联5前情提要。四个彩蛋分别交代了:洛基的立场与行动、浩克已被Doom收入囊中、多元宇宙危机的真实规模(3000个宇宙)、以及毁灭博士的起源与登场方式。看复联5前如果只想补一个'新内容',就补它——它把此前所有猜测变成了官方画面。"
  },
  {
    id: "smff", title: "蜘蛛侠:英雄远征", en: "Spider-Man: Far From Home", year: 2019, studio: "漫威影业×索尼", group: "mcu1", phase: "漫威影业 · 无限传奇", rel: "context", status: "released",
    plot: "托尼离世后,彼得在威尼斯遭遇'元素众'——实为神秘客用全息投影编造的谎言,真相是'当多元宇宙欺诈的第一次演练'。",
    relation: "神秘客向世界公布了蜘蛛侠就是彼得·帕克,直接引爆英雄无归的全线悲剧;也第一次把'多元宇宙'这个词喂给大众。"
  },
  /* ================= 漫威影业 · 多元宇宙传奇 ================= */
  {
    id: "blackwidow", title: "黑寡妇", en: "Black Widow", year: 2021, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "context", status: "released",
    plot: "娜塔莎回归苏联'红房'旧账,与妹妹叶莲娜、父妹的假家庭重聚,摧毁模仿大师计划。",
    relation: "叶莲娜接过黑寡妇衣钵并加入雷霆特工队;本片片尾彩蛋瓦莲蒂娜·阿莱格拉·德·封丹首次登场——她正是组建'雷霆特工队'、也是复联5地球政治线的重要推手。"
  },
  {
    id: "shangchi", title: "尚气与十环传奇", en: "Shang-Chi and the Legend of the Ten Rings", year: 2021, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "context", status: "released",
    plot: "尚气对抗生父徐文武与十环的诅咒,进入外域塔罗,得知十环来自一个更为古老的神秘文明。",
    relation: "十环的真实起源至今未揭晓——粉丝普遍猜测它与拉脱维利亚或毁灭博士有关(纯猜测,官方未确认)。尚气也被直传将现身复联5(传闻)。"
  },
  {
    id: "eternals", title: "永恒族", en: "Eternals", year: 2021, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "minor", status: "released",
    plot: "数千年隐于地球的永恒族揭示真相:他们是天神组的'收割工具',而地球正是新天神出生的育苗场。",
    relation: "把MCU世界观拉到宇宙实体级(天神组)。复联5传闻会涉及更高维的宇宙级威胁,但本片与毁灭博士主线关联度较低。"
  },
  {
    id: "nwh", title: "蜘蛛侠:英雄无归", en: "Spider-Man: No Way Home", year: 2021, studio: "漫威影业×索尼", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "released",
    plot: "神秘客暴露彼得身份后,奇异博士的遗忘咒语被彼得不断打断,咒语失控撕裂多元宇宙——托比版绿魔、章鱼博士、加菲版电光人等纷纷涌入616;三名蜘蛛侠同框击退旧敌。",
    relation: "★多元宇宙第一次大规模'穿帮'。斯坦福咒语的裂缝、被强拉进616的'外来者',本质上是Doom即将打开的潘多拉魔盒的小规模预演;它首次证明:MCU以外的人(与坏蛋)真的可以通过法术强行进来。"
  },
  {
    id: "ds2", title: "奇异博士2:疯狂多元宇宙", en: "Doctor Strange in the Multiverse of Madness", year: 2022, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "released",
    plot: "旺达因失去幻视与双胞胎,黑化追杀穿越宇宙的女孩阿美莉卡·查韦斯;奇异博士跳访838宇宙,那里有X教授、神奇先生(约翰·克拉辛斯基版)、卡特队长、黑蝠王组成的'光照会'。",
    relation: "★838光照会就是'另一个宇宙的英雄团队'的样板——复联5里多宇宙队伍(如福克斯X战警、索尼蜘蛛侠)与616复仇者并肩或对立的关系,正是以此片的格式展开。X教授与神奇先生的真人版在此'验货',为后面的正式登场铺路。"
  },
  {
    id: "thor4", title: "雷神4:爱与雷霆", en: "Thor: Love and Thunder", year: 2022, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "minor", status: "released",
    plot: "屠神者格尔猎杀诸神,索尔与简·福斯特(女雷神)共同迎战,格尔之女获得新生。",
    relation: "与毁灭博士主线关联较弱;简·福斯特的牺牲与格尔的神秘武器'黑死剑'对多元宇宙设定有一定补充,但更多是雷神个人成长线。"
  },
  {
    id: "bp2", title: "黑豹2:瓦坎达万岁", en: "Black Panther: Wakanda Forever", year: 2022, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "minor", status: "released",
    plot: "特查拉离世,苏睿继承黑豹之力,与海底之国塔罗肯(纳摩)的冲突中守护瓦坎达。",
    relation: "MCU地球势力版图进一步扩展;瓦坎达与塔罗肯的地球格局变化,可能影响复联5的多方势力观感,但与Doom主线距离较远。"
  },
  {
    id: "quantumania", title: "蚁人与黄蜂女:量子狂潮", en: "Ant-Man and the Wasp: Quantumania", year: 2023, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "released",
    plot: "斯科特一家坠入量子领域,直面征服者康——一个拥有无数变体的时间暴君,康被'放逐'在量子领域后仍企图逃出并统治多元宇宙。",
    relation: "★复联5的'前任主线'。康是原定反派的'遗留者'的后继者,虽然漫威2023年宣布把复联5从《康之王朝》改为《毁灭之日》,但康的残余威胁与时间线的千疮百孔,正是Doom得以趁虚而入的背景。"
  },
  {
    id: "gotg3", title: "银河护卫队3", en: "Guardians of the Galaxy Vol. 3", year: 2023, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "minor", status: "released",
    plot: "火箭浣熊的黑暗起源揭露,小队为救他对抗'至高进化',最终聚散告别,星爵把队长之位传给螳螂女(自己回地球)。",
    relation: "星爵回到地球——这让他距离复联5的'地球大事件'物理距离最近。片尾已埋下'传说中的星爵将再度归来'的钩子(传闻他将回归复联5)。"
  },
  {
    id: "themarvels", title: "惊奇队长2", en: "The Marvels", year: 2023, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "minor", status: "released",
    plot: "卡罗尔与惊奇少女卡玛拉、光谱莫妮卡因超能力链接互相纠缠,联手阻止克里人女王与'收割者'。",
    relation: "片尾彩蛋把莫妮卡留在X战警宇宙,而惊奇队长一系随时可能回归;为复联5的宇宙线提供后备角色。"
  },
  {
    id: "dpw", title: "死侍与金刚狼", en: "Deadpool & Wolverine", year: 2024, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "released",
    plot: "死侍被TVA招募,拯救他的宇宙;和一条'最烂'的金刚狼变体组队,杀进虚空之地,与卡桑德拉·诺瓦(摧毁一切的X教授双胞胎姐姐)交战;刀锋战士、艾丽卡、牌皇、X-23等老宇宙角色集体回归。",
    relation: "★福克斯宇宙正式并入多元宇宙主线!它系统性地介绍了TVA、'被时间线修剪'的概念、以及老X战警角色的命运。片尾死侍直接向TVA打听'下一个大反派是谁'——这就是复联5的官方预告片。"
  },
  {
    id: "cap4", title: "美国队长4", en: "Captain America: Brave New World", year: 2025, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "released",
    plot: "山姆·威尔逊正式接盾,卷入总统(罗斯)被心灵控制变红浩克的阴谋,揭露一场围绕'亚当提姆/天神族尸体与领导力'的政治风暴。",
    relation: "★新复仇者的政治背景板。山姆现在是实际上的复仇者队长,罗斯(红浩克)的立场、瓦坎达与各国对复仇者的态度,直接决定复联5集结时地球势力的反应。"
  },
  {
    id: "thunderbolts", title: "雷霆特工队*", en: "Thunderbolts*", year: 2025, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "released",
    plot: "叶莲娜、冬兵、幽灵、红色守护者、美国特工、模仿大师被瓦莲蒂娜借口'任务'捏合在一起,接手一个烂摊子;队里的鲍勃(Bob)实为哨兵——拥有近乎神级力量、内心却极度黑洞的黑暗存在,任务很快演变成一场生死存亡战。片尾彩蛋围绕哨兵失控后的'虚无'(The Void)埋下更大伏笔。",
    relation: "★哨兵与他的'虚无'被普遍认为与毁灭博士的威胁规模相当(与复联5的关联为媒体理论,未官方确认)。瓦莲蒂娜作为幕后操盘手,在复联5的政治计算里可能是关键变数——她在漫画中正是与Doom在棋局上博弈系的人物。"
  },
  {
    id: "ff2025", title: "神奇四侠:第一步", en: "The Fantastic Four: First Steps", year: 2025, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "released",
    plot: "在60年代复古美学的平行时间线上,四人因宇宙射线获得能力,成为公众英雄,与毁灭的威胁(行星吞噬者与银影侠)正面对抗,初次展现'全世界第一支超级英雄家庭'。",
    relation: "★这就是复联5的'娘家'。毁灭博士与里德·理查兹是宿敌,神奇四侠的宇宙与616的关系、以及本片彩蛋中与Doom有关联的线索,直接构成复联5开局的钥匙。"
  },
  {
    id: "doomsday", title: "复仇者联盟5:毁灭之日", en: "Avengers: Doomsday", year: 2026, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "upcoming",
    plot: "本指南的主角。小罗伯特·唐尼饰演的毁灭博士率哨兵大军宣战,三个宇宙(主宇宙/X战警宇宙/第三个宇宙)即将碰撞,复仇者、X战警、神奇四侠三方集结对抗。2026年12月18日北美上映(有传闻或改档,以官方为准)。",
    relation: "它本身不再是'一部电影',而是整个40多年漫威改编史的大汇总。下面的所有条目,都是为它做的铺垫。"
  },
  {
    id: "sw2027", title: "复仇者联盟6:秘密战争", en: "Avengers: Secret Wars", year: 2027, studio: "漫威影业", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "direct", status: "upcoming",
    plot: "已定档2027年的终局之作。漫画原著中,'秘密战争'由毁灭博士夺取宇宙创造者的力量主宰'战斗世界'(Battleworld)开始——多元宇宙被压缩成一块拼图大陆。",
    relation: "复联5与复联6实为上下集关系的两幕。若Doom的野心与'成神'计划照搬漫画,复联5是他升神的铺垫,复联6是决战。"
  },
  {
    id: "smbnd", title: "蜘蛛侠:崭新之日", en: "Spider-Man: Brand New Day", year: 2026, studio: "漫威影业×索尼", group: "mcu2", phase: "漫威影业 · 多元宇宙传奇", rel: "context", status: "released",
    plot: "2026年7月31日上映(《蜘蛛侠4》)。身份被世界遗忘之后,彼得·帕克在'全新的一天'里面对成长、责任与新的敌人,被索尼称为'最情绪化、最成熟'的一版蜘蛛侠。片中最重磅的揭示是:萨迪·辛克(Sadie Sink)饰演的正是凤凰女琴·葛蕾(Jean Grey)。",
    relation: "★两条线与复联5直接相关:①琴·葛蕾在蜘蛛侠电影里正式亮相,意味着漫威将在下一阶段正式开启'变种人篇章'(X战警并入MCU主线)——这也解释了复联5为何要把变种人宇宙拉到同一张棋盘上;②本片中的暴走事件,引出了《复联4加码臻享版》彩蛋里'班纳自我封印、随后被毁灭博士收集'的关键情节。荷兰弟版蜘蛛侠是否会出现在复联5,目前仍无官方说法。"
  },
  /* ================= 20世纪福克斯 · X战警宇宙 ================= */
  {
    id: "xm1", title: "X战警", en: "X-Men", year: 2000, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "direct", status: "released",
    plot: "世界第一部现代超级英雄大片(之一)。万磁王想用机器让人类突变,人类需要X战警来解决质疑——变种人在仇恨与恐惧的时代开始集结。",
    relation: "福克斯宇宙的起点。预告片中X战警们的登场,就是从这条线走出来的角色,他们将在复联5以'另一个宇宙的变种人'身份登场,本片是认识他们和他们恩怨的第一课。"
  },
  {
    id: "xm2", title: "X战警2", en: "X2: X-Men United", year: 2003, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "context", status: "released",
    plot: "人类用'X武器'计划清洗变种人,X战警与万磁王阵营短暂结盟,初步揭示金刚狼与X武器计划的牵连。",
    relation: "让'人类对变种人的恐惧'成为系列骨架,这也是复联5里'哨兵大军'存在的理由——哨兵正是福克斯X战警宇宙里人类为了猎杀变种人而建造的机器人。"
  },
  {
    id: "xm3", title: "X战警3:背水一战", en: "X-Men: The Last Stand", year: 2006, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "minor", status: "released",
    plot: "'解药'出现、琴·葛蕾黑化为凤凰,万磁王与X教授阵营两败俱伤。",
    relation: "凤凰之力的线索(琴·葛蕾的暗面)在这部立住,黑凤凰则是它的最终章;与复联5的直接关联较弱,但它完善了X战警宇宙的终结叙事。"
  },
  {
    id: "wolverine1", title: "金刚狼", en: "X-Men Origins: Wolverine", year: 2009, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "context", status: "released",
    plot: "罗根的早年:与兄弟维克特(剑齿虎)一起当雇佣兵、被X武器计划改造获得金刚狼爪,以及艾德曼合金植入。",
    relation: "狼爪与愈合因子的起点。死侍与金刚狼里这位'最烂变体罗根'的中年丧志,正是对这条起源线的延伸;复联5若带出金刚狼变体,这部就是他的前史。"
  },
  {
    id: "firstclass", title: "X战警:第一战", en: "X-Men: First Class", year: 2011, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "context", status: "released",
    plot: "年轻的X教授与万磁王在1960年代冷战铁幕下集结第一批变种人,最终因理念分歧决裂——从挚友到宿敌。",
    relation: "'仇敌与挚友彼此造就'的叙事模板,同样适用于毁灭博士与里德·理查兹——两位天才、分道扬镳的宿命感,在这部片里看得最清楚。"
  },
  {
    id: "wolverine2", title: "金刚狼2", en: "The Wolverine", year: 2013, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "minor", status: "released",
    plot: "罗根流亡日本,卷入矢志田家族与万磁王、蛇牙的恩怨,失去自愈因子后重新找回人性。",
    relation: "与复联5的直接连接很少,但它让罗根真正'接纳'了时间与死亡——这为罗根之死与他的变体出现提供了情感重量。"
  },
  {
    id: "dofp", title: "X战警:逆转未来", en: "X-Men: Days of Future Past", year: 2014, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "direct", status: "released",
    plot: "未来时间线被'哨兵'机器人种族灭绝,金刚狼穿越回1973年改写历史,最终时间线被重塑——新旧两代X战警宇宙并存。",
    relation: "★福克斯宇宙自己的'时间旅行/多元宇宙'电影,哨兵机器人的概念与预告里Doom率领的哨兵大军直接同源;这部也第一次让漫威粉丝尝到'时间线重写'的味道。"
  },
  {
    id: "apocalypse", title: "X战警:天启", en: "X-Men: Apocalypse", year: 2016, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "context", status: "released",
    plot: "史上第一个变种人'天启'苏醒,招纳四骑士企图重塑世界,年轻一代X战警首次集结迎战。",
    relation: "镭射眼、暴风女、琴·葛蕾、快银等人的'少年时代'在本片定调——他们正是复联5预告里X战警阵容的主力人选,这部能最快速识别他们。"
  },
  {
    id: "logan", title: "金刚狼3:殊死一战", en: "Logan", year: 2017, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "direct", status: "released",
    plot: "2029年,变种人几近灭绝,老罗根护送'X-23'劳拉穿越美国,最终战死;新世代的希望由孩子接过。",
    relation: "★罗根的告别演出。在《死侍与金刚狼》里那条老年、丧妻、颓废的'最烂金刚狼'变体,就是本片罗根的精神续写;X-23劳拉也是复联5预测名单里的热门人选(未官宣)。"
  },
  {
    id: "deadpool1", title: "死侍", en: "Deadpool", year: 2016, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "context", status: "released",
    plot: "雇佣兵韦德·威尔逊被改造出不死之身,戴上红色面罩,用打破第四面墙的嘴炮复仇、吐槽一切。",
    relation: "福克斯宇宙'最不正经的救世主'。他在《死侍与金刚狼》里正式进入MCU主线,并成为串联福克斯宇宙与复联5的引信角色。"
  },
  {
    id: "deadpool2", title: "死侍2", en: "Deadpool 2", year: 2018, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "context", status: "released",
    plot: "死侍组团抗衡'电索'回到过去追杀少年变种人火拳,最终用时间装置把一切弄得('几乎')很圆满。",
    relation: "时间装置的胡来,与《死侍与金刚狼》的TVA世界观直接续上;死侍'在时间线上乱蹦'的设定让他成为漫威官方钦定的'多元宇宙破壁人'。"
  },
  {
    id: "darkphoenix", title: "X战警:黑凤凰", en: "Dark Phoenix", year: 2019, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "minor", status: "released",
    plot: "琴·葛蕾被宇宙级凤凰之力吞噬,在X教授与万磁王的纠葛中失控,福克斯X战警系列的最后一幕。",
    relation: "福克斯宇宙的落幕之作(虽然口碑不佳)——该宇宙自此被迪士尼收购后的MCU正式接手,复联5要'借用'的就是这批角色与他们的遗产。"
  },
  {
    id: "newmutants", title: "新变种人", en: "The New Mutants", year: 2020, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · X战警宇宙", rel: "minor", status: "released",
    plot: "五个年轻变种人被关在疗养院,恐怖氛围中觉醒能力,合力打败吞噬他们恐惧的'恶魔熊'。",
    relation: "福克斯宇宙最后的库存,与复联5无直接关联,但'年轻变种人'的概念会在未来MCU继续发酵。"
  },
  {
    id: "ff2005", title: "神奇四侠", en: "Fantastic Four", year: 2005, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · 神奇四侠", rel: "direct", status: "released",
    plot: "里德·理查兹一行四人太空试验遭遇宇宙射线,获得能力成为神奇四侠;而资助者维克多·万·杜姆博士也在实验中毁容,戴上金属面具化身'毁灭博士'。",
    relation: "★毁灭博士第一次真人登场!查克·麦克马洪版的'凡多姆博士'奠定了'天才+自负+拉脱维利亚君主'的真人形象基础。看复联5前,了解'杜姆博士如何成为毁灭博士',一定要先看这段起源。"
  },
  {
    id: "ff2007", title: "神奇四侠2:银影侠", en: "Fantastic Four: Rise of the Silver Surfer", year: 2007, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · 神奇四侠", rel: "context", status: "released",
    plot: "银影侠为行星吞噬者'接引',地球陷入吞星危机,毁灭博士趁机窃取银影之力。",
    relation: "把'行星吞噬者'(Galactus)带入真人荧幕——他是漫画中毁灭博士成神之路的关键一环,而本片是唯一一部真人版吞星电影,对了解'宇宙级反派'很有帮助。"
  },
  {
    id: "ff2015", title: "神奇四侠", en: "Fantastic Four", year: 2015, studio: "20世纪福克斯", group: "fox", phase: "20世纪福克斯 · 神奇四侠", rel: "minor", status: "released",
    plot: "阴暗写实风格的重启版:里德与杜姆在一次'跨维度传送'实验中结怨,杜姆被'Z星球'吞噬成一具黑化面具男。",
    relation: "评价惨败的重启,但它发明了一个有趣设定:杜姆的变强源于跨维度传送——与MCU版的多元宇宙脉络暗中合拍。传闻仅供了解,非必须观看。"
  },
  /* ================= 索尼影业 · 蜘蛛侠宇宙 ================= */
  {
    id: "sm1", title: "蜘蛛侠", en: "Spider-Man", year: 2002, studio: "索尼影业", group: "sony", phase: "索尼 · 托比版蜘蛛侠", rel: "context", status: "released",
    plot: "被变种蜘蛛咬了的少年彼得·帕克领悟'能力越大,责任越大',穿上红蓝战衣击败绿魔。传奇的开始。",
    relation: "多元宇宙蜘蛛侠的三巨头之一(托比·马奎尔)。复联5尚未官宣托比版回归,但'蜘蛛侠多元宇宙'已是索尼与漫威的官方设定,他随时可能以'其他宇宙的蜘蛛侠'身份登场。同时,八爪博士在《英雄无归》里的王者归来,让本片的两位宿敌全部归位。",
  },
  {
    id: "sm2", title: "蜘蛛侠2", en: "Spider-Man 2", year: 2004, studio: "索尼影业", group: "sony", phase: "索尼 · 托比版蜘蛛侠", rel: "context", status: "released",
    plot: "彼得与梅姨、玛丽·简的拉扯,八爪博士登场;结尾蜘蛛侠在电车里救人的一幕成为经典——'英雄不是没有选择,而是选择善意'。",
    relation: "八爪博士在《英雄无归》里王者归来,托比版宇宙正式接入多元宇宙;本片'能力越大,责任越大'的表述,是理解蜘蛛侠为何始终是多元宇宙故事核心的钥匙。"
  },
  {
    id: "sm3", title: "蜘蛛侠3", en: "Spider-Man 3", year: 2007, studio: "索尼影业", group: "sony", phase: "索尼 · 托比版蜘蛛侠", rel: "context", status: "released",
    plot: "毒液共生体附身托比版蜘蛛侠,黑化膨胀;沙人、毒液、新绿魔三大反派围剿,托比版系列的终结之作。",
    relation: "毒液共生体第一次真人亮相——而毒液系列如今与多元宇宙纠缠(毒液2彩蛋、毒液3的Knull),托比版毒液也出现在英雄无归的念旧镜头里。"
  },
  {
    id: "tas1", title: "超凡蜘蛛侠", en: "The Amazing Spider-Man", year: 2012, studio: "索尼影业", group: "sony", phase: "索尼 · 加菲版蜘蛛侠", rel: "context", status: "released",
    plot: "加菲版彼得·帕克追寻父母之死真相,在击败蜥蜴人时遇见格温·斯泰西——一段注定悲剧的爱情开始了。",
    relation: "加菲版在《英雄无归》里用'拯救MJ'完成了自我救赎,成为多元宇宙蜘蛛侠叙事里最动人的一章。他若出现在复联5,粉丝会疯。"
  },
  {
    id: "tas2", title: "超凡蜘蛛侠2", en: "The Amazing Spider-Man 2", year: 2014, studio: "索尼影业", group: "sony", phase: "索尼 · 加菲版蜘蛛侠", rel: "context", status: "released",
    plot: "格温之死改变了加菲版彼得的一切;电光人、犀牛人接连袭来,奥斯本家族的黑暗秘密揭开。",
    relation: "格温之死是加菲版宇宙的'创伤原点'——英雄无归里他抱住MJ正是这段记忆的具象化;多元宇宙'赎罪叙事'因此成为蜘蛛侠线的感情钩子。"
  },
  {
    id: "venom1", title: "毒液", en: "Venom", year: 2018, studio: "索尼影业", group: "sony", phase: "索尼 · 毒液/反派宇宙", rel: "context", status: "released",
    plot: "记者艾迪·布洛克意外与外星共生体'毒液'合体,成为反英雄,与生命基金会及'暴乱'大战。",
    relation: "索尼宇宙(SPUMC)的开山之作。毒液在复联5的预测名单里属于'黑马'——当多元宇宙全面开放,任何宇宙的角色都可能被卷进来(见预测区)。"
  },
  {
    id: "venom2", title: "毒液2:屠杀开始", en: "Venom: Let There Be Carnage", year: 2021, studio: "索尼影业", group: "sony", phase: "索尼 · 毒液/反派宇宙", rel: "context", status: "released",
    plot: "艾迪与毒液对抗共生体'屠杀'与'嚎叫';片尾彩蛋里毒液被传送进MCU,看了会儿'蜘蛛侠'新闻又返回自己的宇宙——索尼宇宙与MCU的第一次'串门'。",
    relation: "★索尼宇宙与MCU接触的官方证据。虽然毒液还没正式在MCU里登场,但'传送漩涡'机制与警告『你的世界将会改变』直接呼应复联5涉及的多元宇宙门户。"
  },
  {
    id: "venom3", title: "毒液3:最后一舞", en: "Venom: The Last Dance", year: 2024, studio: "索尼影业", group: "sony", phase: "索尼 · 毒液/反派宇宙", rel: "context", status: "released",
    plot: "共生体之神'纳尔'(Knull)追杀毒液,艾迪与毒液被迫踏上逃亡之路,开放式结局留下了纳尔的威胁。",
    relation: "纳尔(共生体之神)是索尼宇宙的终极反派,与复仇者体系的关联在漫画中(Avengers于反纳尔战争)有迹可循,但目前均为推测。复联5若要联动索尼宇宙,纳尔是现成的钩子。"
  },
  {
    id: "morbius", title: "莫比亚斯", en: "Morbius", year: 2022, studio: "索尼影业", group: "sony", phase: "索尼 · 毒液/反派宇宙", rel: "minor", status: "released",
    plot: "患病科学家莫比亚斯用蝙蝠基因改造自己成为'活体吸血鬼',口碑与票房双扑的一作。",
    relation: "与MCU的关联仅限彩蛋:MCU宇宙的'秃鹫'被某种力量传送进索尼宇宙——这证明'宇宙间传送'正在变得越来越频繁,但本片本身与复联5主线无关。"
  },
  {
    id: "madameweb", title: "蜘蛛夫人", en: "Madame Web", year: 2024, studio: "索尼影业", group: "sony", phase: "索尼 · 毒液/反派宇宙", rel: "minor", status: "released",
    plot: "急救员卡桑德拉·韦伯预见未来,保护三名年轻蜘蛛女侠候选者。口碑崩盘之作。",
    relation: "若不聊'未来的蜘蛛侠电又失败了一次'这个梗,它与复联5没有关联。"
  },
  {
    id: "kraven", title: "猎人克莱文", en: "Kraven the Hunter", year: 2024, studio: "索尼影业", group: "sony", phase: "索尼 · 毒液/反派宇宙", rel: "minor", status: "released",
    plot: "谢尔盖·克拉维诺夫获得野性之力,成为顶级猎手,与狮群、暴徒战斗;索尼宇宙的最后一批存货(之一)。",
    relation: "与复联5无直接关联。若索尼宇宙将并入MCU,克莱文是蜘蛛侠宿敌候选人,但官方尚无动作。"
  },
  {
    id: "itsv", title: "蜘蛛侠:平行宇宙", en: "Spider-Man: Into the Spider-Verse", year: 2018, studio: "索尼影业", group: "sony", phase: "索尼 · 蜘蛛宇宙动画", rel: "context", status: "released",
    plot: "迈尔斯·莫拉莱斯成为另一个宇宙的蜘蛛侠,与来自各地的蜘蛛侠(佩妮、诺瓦尔、警长等)一起对抗'金并',打破第四面墙的动画神作。",
    relation: "整个'蜘蛛侠多元宇宙'概念最完整的影像教材——证明多元宇宙可以同时容无数个蜘蛛侠。复联5的多宇宙阵容设定,在观众认知层面就是这部片预热的。"
  },
  {
    id: "atsv", title: "蜘蛛侠:纵横宇宙", en: "Spider-Man: Across the Spider-Verse", year: 2023, studio: "索尼影业", group: "sony", phase: "索尼 · 蜘蛛宇宙动画", rel: "context", status: "released",
    plot: "迈尔斯被'蜘蛛侠协会'追捕——人家要维护'所有宇宙的固定剧情',他偏要改写它;格温的宇宙线并行展开。",
    relation: "把'多元宇宙的秩序与反叛'主题推向哲学层;格温的宇宙破碎是复联5中'宇宙崩解'概念的绝佳视觉参考。"
  },
  {
    id: "btsv", title: "蜘蛛侠:超越宇宙", en: "Spider-Man: Beyond the Spider-Verse", year: "未定档", studio: "索尼影业", group: "sony", phase: "索尼 · 蜘蛛宇宙动画", rel: "context", status: "upcoming",
    plot: "纵横宇宙的续章,迈尔斯与格温的结局篇。截至2026年8月仍未公布档期。",
    relation: "同期话题作品;与复联5无官方联动,但会在同一年继续夯实'多元宇宙蜘蛛侠'的大众认知。"
  },
  /* ================= 其他公司出品 ================= */
  {
    id: "howard", title: "霍华德鸭", en: "Howard the Duck", year: 1986, studio: "环球影业", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "被传送进人类世界的鸭子外星人霍华德,穿梭于地下摇滚与中国餐馆之间,对抗黑暗统治者。卢卡斯影业出品、史上第一部基于漫威漫画的真人影院电影(口碑与票房双双惨败)。",
    relation: "一部'梗片';银河护卫队片尾彩蛋与小银幕里霍华德鸭的老客串,官方认证它是MCU的一个宇宙邻居。看复联5前当彩蛋梗了解即可。"
  },
  {
    id: "hulk2003", title: "绿巨人浩克", en: "Hulk", year: 2003, studio: "环球影业(李安执导)", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "布鲁斯·班纳在基因事故中成为绿巨人,被父亲的大卫·班纳利用,最后被军队追捕到巴西。李安导演的文艺向浩克。",
    relation: "独立宇宙,与MCU无关。世界观理解上可跳过;浩克的'科学怪人式悲剧'气质在MCU的《无敌浩克》与系列剧情中有所延续。"
  },
  {
    id: "punisher1989", title: "惩罚者", en: "The Punisher", year: 1989, studio: "New World Pictures", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "弗兰克·卡斯特的家人被杀后,他化身'惩罚者'在黑帮中大开杀戒,保护一座孤儿院(龙格尔主演,史上第一部惩罚者电影,国际有限公映,美国以录像带发行为主)。",
    relation: "史上最早的三部惩罚者之一,与MCU无关联。漫画里惩罚者曾在某些多元宇宙事件里与复仇者并肩,但电影线属于独立老片。"
  },
  {
    id: "punisher2004", title: "惩罚者", en: "The Punisher", year: 2004, studio: "狮门影业", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "汤姆·简版惩罚者:警察家庭被灭门后,弗兰克单挑整个犯罪家族,最后的'豪宅大屠杀'非常硬核。",
    relation: "与MCU无关的独立宇宙。若复联5走漫画式'多元宇宙罪犯'混战,老惩罚者只是一个遥远的可能。"
  },
  {
    id: "punisher2008", title: "惩罚者:战争地带", en: "Punisher: War Zone", year: 2008, studio: "狮门影业", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "雷·史蒂文森版惩罚者,对战'拼接人'比利·鲁索,暴力美学拉满,票房惨淡。",
    relation: "与MCU无关。瑞恩·雷诺兹曾在片中演'警察'一角,后来成了死侍——这不是多元宇宙梗,是演员梗。"
  },
  {
    id: "blade1", title: "刀锋战士", en: "Blade", year: 1998, studio: "新线影业", group: "other", phase: "其他 · 老漫威真人片", rel: "direct", status: "released",
    plot: "半人半吸血鬼的猎手刀锋(韦斯利·斯奈普斯饰)在血族之城杀吸血鬼、护人类,世纪末的黑色动作经典。",
    relation: "韦斯利·斯奈普斯版刀锋在《死侍与金刚狼》中回归出演!'刀锋战士'从90年代老宇宙被拉进MCU多元宇宙的可能性由此大幅上升——复联5若出现老刀锋,不要惊讶。"
  },
  {
    id: "blade2", title: "刀锋战士2", en: "Blade II", year: 2002, studio: "新线影业", group: "other", phase: "其他 · 老漫威真人片", rel: "context", status: "released",
    plot: "刀锋与血族残存者结盟,对战'收割者'变异体;吉尔莫·德尔·托罗执导,黑暗视觉巅峰。",
    relation: "奠定了刀锋的硬汉宇宙身份。他在《死侍与金刚狼》里说'永远是刀锋,只有刀锋'——老宇宙角色们的背影,正在复联5的多宇宙大戏里等待归队。"
  },
  {
    id: "blade3", title: "刀锋战士3:三位一体", en: "Blade: Trinity", year: 2004, studio: "新线影业", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "刀锋与夜行者、吸血鬼猎人'阿比盖尔'对抗吸血鬼之王德雷克,瑞安·雷诺兹饰演的'汉尼拔'搭档加入。",
    relation: "口碑崩了的第三部,但韦斯利·斯奈普斯版刀锋在《死侍与金刚狼》里'第三次回归'时,雷神本家漫威对它开起了官方玩笑(枪击'死侍'的演员梗)。"
  },
  {
    id: "daredevil2003", title: "夜魔侠", en: "Daredevil", year: 2003, studio: "20世纪福克斯", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "盲人律师马特·默多克白天在法庭,夜晚化身夜魔侠扫荡地狱厨房,对手是金并与艾丽卡。本·阿弗莱克主演。",
    relation: "老版夜魔侠与MCU无关。但注意:MCU自己的夜魔侠(查理·考克斯)是多元宇宙传奇阶段唯一幸存的'街头英雄'之一,复联5里他可能出现(见预测区),与2003版是不同的角色。"
  },
  {
    id: "elektra", title: "艾丽卡", en: "Elektra", year: 2005, studio: "20世纪福克斯", group: "other", phase: "其他 · 老漫威真人片", rel: "context", status: "released",
    plot: "被暗影组织训练成'杀手'的艾丽卡,金发美女版刺客与掌中双叉的复仇路。票房口碑双输。",
    relation: "詹妮弗·加纳版艾丽卡在《死侍与金刚狼》里以老宇宙身份回归!虽无官方确认她会进复联5,但'第一代漫威电影宇宙的幸存者'集结的趋势已经很明显。"
  },
  {
    id: "ghostrider1", title: "恶灵骑士", en: "Ghost Rider", year: 2007, studio: "索尼影业", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "特技车手约翰尼·布雷兹与魔鬼签订契约,白天飞车,黑夜化身骷髅骑手'恶灵骑士'烧尽罪人之魂。",
    relation: "尼古拉斯·凯奇版独立宇宙。与MCU无直接关联;但恶灵骑士在漫画里与复仇者有过交集,始终是'传闻中的候选角色'之一。"
  },
  {
    id: "ghostrider2", title: "恶灵骑士2:复仇之魂", en: "Ghost Rider: Spirit of Vengeance", year: 2012, studio: "索尼影业", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "凯奇再披骷髅头盔,在土耳其荒原追击魔鬼之子,把'恶灵骑士'拍成了B级片狂欢。",
    relation: "与复联5无关联,可作为'恶灵骑士电影为何需要重启'的注脚——MCU版恶灵骑士(疑似MCU官方规划)尚未官方官宣。"
  },
  {
    id: "manthing", title: "沼泽怪物(曼-辛)", en: "Man-Thing", year: 2005, studio: "狮门影业", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "沼泽传说中的怪物'摸泥人'守护沼泽,吞噬冒犯者;一部只在美国部分市场直接发行光盘的B级恐怖片。",
    relation: "与MCU无关,但它在漫威漫画里的性格与'沼泽恶棍'背景,偶尔会被粉丝回锅。非必看。"
  },
  {
    id: "bighero6", title: "超能陆战队", en: "Big Hero 6", year: 2014, studio: "迪士尼动画(改编自漫威漫画)", group: "other", phase: "其他 · 番外动画", rel: "minor", status: "released",
    plot: "天才少年小宏与治疗机器人'大白'化身英雄小队,守护'旧京山'。迪士尼动画工作室的漫威改编作品。",
    relation: "它是迪士尼动画的漫威漫画改编,不属MCU正史;但'第六大英雄'的漫画设定与大白的反差,是漫威产权全球化的一个经典注脚。"
  },
  {
    id: "cap1990", title: "美国队长(1990)", en: "Captain America", year: 1990, studio: "21世纪电影公司", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "低成本美队片:二战时期的故事,红骷髅与'超级战士阴谋'的拙劣模仿。仅在少数国家院线公映,美国本土1992年以录像带发行。",
    relation: "作为'半公映'老片了解即可,与复联5无任何关联。"
  },
  {
    id: "ff1994", title: "神奇四侠(1994)", en: "Fantastic Four", year: 1994, studio: "新康斯坦丁影业", group: "other", phase: "其他 · 从未公映作品", rel: "minor", status: "released",
    plot: "罗杰·科尔曼版神奇四侠——出品方当年为保住版权而拍,按协议从未正式公映,成了影史著名'库存电影'。",
    relation: "从未公映,不进入'上映过'正史,但作为'漫威为版权拍片'的历史注脚值得知道。"
  },
  {
    id: "sm1977", title: "蜘蛛侠(1977电视电影)", en: "Spider-Man (TV Movie)", year: 1977, studio: "哥伦比亚/环球电视", group: "other", phase: "其他 · 老漫威真人片", rel: "minor", status: "released",
    plot: "史上第一部蜘蛛侠真人电影:尼古拉斯·哈蒙德主演的电视电影,后曾在部分国家以院线形式上映,并衍生出两部长篇特輯。",
    relation: "漫威角色第一次真人化的大银幕尝试(之一),属历史注脚,与复联5无关联。"
  }
];

/* ================= 补充:重要电视剧集(精选) ================= */
var TV_SHOWS = [
  {
    id: "loki", title: "洛基", en: "Loki", year: "2021-2023", studio: "漫威影业(Disney+)", rel: "direct",
    plot: "复仇者联盟1的'时间逃犯'洛基被时间变异管理局(TVA)收编。他发现TVA的真相:时间线由'遗留者'(康的变体之一)维持。洛基杀死遗留者,目睹多元宇宙的无限分支爆发,最终在时间尽头坐上王座,守护不断生长的'时间树'。",
    relation: "★复联5最重要的前传剧集!TVA、康之死、多元宇宙爆发、以及'时间尽头的那场对话',全部在这里。看复联5前,这部剧必须看。"
  },
  {
    id: "wandavision", title: "旺达幻视", en: "WandaVision", year: "2021", studio: "漫威影业(Disney+)", rel: "context",
    plot: "旺达用魔法制造西景镇的完美家庭,在悲伤中诞下双胞胎;'女巫'阿加莎揭示真相,旺达最终觉醒为'绯红女巫'。",
    relation: "旺达的成长与牺牲是《奇异博士2》的起点,而她的能力来源(混沌魔法)在多元宇宙格局中举足轻重。"
  },
  {
    id: "fatws", title: "猎鹰与冬兵", en: "The Falcon and the Winter Soldier", year: "2021", studio: "漫威影业(Disney+)", rel: "context",
    plot: "山姆与巴基在'新世界'里处理超级士兵血清的扩散危机,山姆最终接过美队的盾。",
    relation: "山姆接盾的完整过程,与《美国队长4》直接衔接;复联5里他的领导地位由此而来。"
  },
  {
    id: "hawkeye", title: "鹰眼", en: "Hawkeye", year: "2021", studio: "漫威影业(Disney+)", rel: "minor",
    plot: "克林特·巴顿在圣诞季带'继承者'凯特·毕晓普对抗金并的街头势力。",
    relation: "凯特与叶莲娜登上雷霆特工队名单前的重要环节,但对复联5主线的直接作用有限。"
  },
  {
    id: "moonknight", title: "月光骑士", en: "Moon Knight", year: "2022", studio: "漫威影业(Disney+)", rel: "minor",
    plot: "多重人格的马克·斯佩克特受埃及月神孔舒驱使,成为'月光骑士'对抗邪神。",
    relation: "神系战引入更广阔的宇宙观,但与Doom主线关联度低;未来漫威宇宙'传奇人物'版图中可能占一席。"
  },
  {
    id: "msmarvel", title: "惊奇少女", en: "Ms. Marvel", year: "2022", studio: "漫威影业(Disney+)", rel: "minor",
    plot: "泽西城少女卡玛拉·汗发现自己能操控光能,追寻祖母的'家族传承'——其实是一道时空护腕。",
    relation: "结尾携带一条'真正的惊奇少女'彩蛋,卡玛拉已在《惊奇队长2》登场,是未来的宇宙线储备角色。"
  },
  {
    id: "shehulk", title: "女浩克", en: "She-Hulk", year: "2022", studio: "漫威影业(Disney+)", rel: "minor",
    plot: "律师珍妮弗·沃尔特斯意外获得绿巨人血统,成为'女浩克',并不断打破第四面墙。",
    relation: "喜剧向;第四面墙用法与死侍有异曲同工之妙,但剧情上与复联5无直接关联。"
  },
  {
    id: "secretinvasion", title: "秘密入侵", en: "Secret Invasion", year: "2023", studio: "漫威影业(Disney+)", rel: "minor",
    plot: "斯克鲁人渗透地球高层,尼克·弗瑞归来收拾残局。口碑一般,但埋下了'外星势力仍在暗中布局'的线索。",
    relation: "斯克鲁人的间谍网络与复联5的政治惊悚面或有交集,但官方未确认联动。"
  },
  {
    id: "echo", title: "回声", en: "Echo", year: "2024", studio: "漫威影业(Disney+)", rel: "minor",
    plot: "聋哑街头战士'回声'玛雅回到家乡,与'舅舅'金并反目。",
    relation: "金并的街头帝国线在《夜魔侠:重生》中延续,与复联5主线距离较远。"
  },
  {
    id: "agatha", title: "阿加莎:混沌女巫团", en: "Agatha All Along", year: "2024", studio: "漫威影业(Disney+)", rel: "context",
    plot: "失去魔力的阿加莎组建'女巫团',一路试炼,意外唤醒了旺达的儿子'比利',并揭示他是个'混沌魔法的造物'。",
    relation: "结局暗示'少年复仇者'正在逐渐成型——这是十年后的MCU骨干,而多元宇宙事件(包括Doom)正是他们登场的历史性契机。"
  },
  {
    id: "ddba", title: "夜魔侠:重生", en: "Daredevil: Born Again", year: "2025", studio: "漫威影业(Disney+)", rel: "context",
    plot: "马特·默多克重振律所与'(前)超能力治安业',与金并的权力博弈白热化,并遭遇自己的'死亡'与重生。",
    relation: "街头的苦行僧英雄,在多元宇宙风暴面前反而最冷静。传闻中他是复联5地球线的一员(见预测区)。"
  },
  {
    id: "ironheart", title: "钢铁之心", en: "Ironheart", year: "2025", studio: "漫威影业(Disney+)", rel: "context",
    plot: "天才少女莉莉·威廉姆斯造出钢铁侠战甲的'继任者'装甲,挑战魔法与科技的边界。",
    relation: "托尼遗产的延续者之一;以科技对抗魔法(Doom是魔法+科技双修的典型)的主题,让她可能成为复联5的伏笔。"
  },
  {
    id: "whatif", title: "假如…?", en: "What If...?", year: "2021-2024", studio: "漫威影业(Disney+动画)", rel: "direct",
    plot: "观察者(Uatu)带你以'假如'的方式重演MCU的无数种结局:如果佩吉·卡特注射血清、如果特查拉成为星爵、如果奇异博士一错到底……多元宇宙的每一个'如果'都是一条真实支线。",
    relation: "★多元宇宙设定最直观的科普课!复联5战斗的'无数个宇宙'里,这正是它们的可视化教材。观察者能否降临复联5是粉丝热议话题。"
  },
  {
    id: "xmen97", title: "X战警97", en: "X-Men '97", year: "2024", studio: "漫威影业(Disney+动画)", rel: "direct",
    plot: "90年代经典《X战警》动画的正统续作:在X教授离去的世界,老一代X战警(镭射眼、暴风女、琴、金刚狼、万磁王……)面对新危机。",
    relation: "它证明变种人宇宙仍在延续,并'验货'了X战警的多位主力——复联5预告里那批X战警,很多成员与这部动画一脉相承。"
  },
  {
    id: "yfnsm", title: "你的友好邻居蜘蛛侠", en: "Your Friendly Neighborhood Spider-Man", year: "2025", studio: "漫威影业(Disney+动画)", rel: "minor",
    plot: "平行宇宙616A的彼得·帕克成长故事,与主宇宙故事交错的青春冒险。",
    relation: "一款官方授权的'平行宇宙蜘蛛侠'动画,随时可以作为多元宇宙线的补给。"
  }
];

/* ================= 扩展信息:待映/特殊说明 ================= */
var EXTRA_NOTE = [
  { title: "看不了全部?先看这几部", text: "时间有限,按「直接相关」标签筛选——优先补《复联3》《复联4》《英雄无归》《奇异博士2》《死侍与金刚狼》《神奇四侠:第一步》《蚁人3》《雷霆特工队*》和《洛基》剧集,再按需扩展。" }
];

/* ================= 彩蛋速报:《复联4加码臻享版》×《蜘蛛侠4》 ================= */
var EASTER_EGGS = [
  {
    n: "01", title: "门外站着的是洛基", film: "《复联4:终局之战》加码臻享版(伽马尊享版)",
    text: "结尾史蒂夫·罗杰斯与佩姬·卡特跳舞的经典画面里,突然有人敲门——打开门,门外站着的竟是洛基。",
    rel: "与复联5的关系:洛基不再只是'时间尽头的神',而是能主动介入他人人生时间线的人。这直接对应预告中'洛基处于一切中心'的位置,也把《洛基》剧集的时间树设定接进了复联5主线。"
  },
  {
    n: "02", title: "班纳自我封印,浩克被'收集'", film: "《复联4:终局之战》加码臻享版(伽马尊享版)",
    text: "彩蛋交代:班纳在《蜘蛛侠4》的暴走事件后,选择对自己进行自我封印;随后,毁灭博士将其'收集'带走。",
    rel: "与复联5的关系:浩克就此正式进入复联5阵容——但身份是'被收集者'。复仇者最强的力量,现在握在毁灭博士手里,这是全片最黑暗的一条伏笔。"
  },
  {
    n: "03", title: "TVA 发现三千个宇宙正在相撞", film: "《复联4:终局之战》加码臻享版(伽马尊享版)",
    text: "时间变异管理局(TVA)监测到:三千个宇宙正在相撞——远超出官方梗概里'三个宇宙'的规模。",
    rel: "与复联5的关系:把官方'三个宇宙碰撞'的设定扩展成一场全多元宇宙级灾难,说明Doom引发的危机尺度比预告展示的还要大得多。"
  },
  {
    n: "04", title: "钢铁侠的彩蛋 → 毁灭博士制作面具", film: "《复联4:终局之战》加码臻享版(伽马尊享版)",
    text: "原本属于钢铁侠的结尾彩蛋被替换成:毁灭博士亲手打造面具的过程——面具之下,是托尼·斯塔克的脸。",
    rel: "与复联5的关系:第一次正面交代毁灭博士的起源与登场方式,也是'钢铁侠的遗产如何变成毁灭博士'这个核心命题的官方注脚。"
  },
  {
    n: "05", title: "凤凰女琴·葛蕾正式登场", film: "《蜘蛛侠4:崭新之日》",
    text: "影片揭示:萨迪·辛克(Sadie Sink)饰演的正是凤凰女琴·葛蕾(Jean Grey)。",
    rel: "与复联5的关系:变种人正式进入MCU主线的信号——漫威将在下一阶段开启'变种人篇章',而复联5(X战警宇宙已确定参战)正是这条路的起点。"
  }
];
