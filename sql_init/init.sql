--
-- PostgreSQL database dump
--

\restrict ADPmUNLKsTeiBck0D9IzFhZbdOs5qTQImVPDhFVK0W4gt9E9bMKV7OiAhSShOY1

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-29 09:21:29

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 17467)
-- Name: age_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.age_groups (
    id uuid NOT NULL,
    name character varying(100) NOT NULL
);


ALTER TABLE public.age_groups OWNER TO postgres;

--
-- TOC entry 216 (class 1259 OID 16384)
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- TOC entry 232 (class 1259 OID 34032)
-- Name: checkpoint_answers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkpoint_answers (
    id integer NOT NULL,
    checkpoint_id integer NOT NULL,
    option_order smallint,
    answer_text text NOT NULL,
    is_correct boolean DEFAULT false NOT NULL
);


ALTER TABLE public.checkpoint_answers OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 34031)
-- Name: checkpoint_answers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checkpoint_answers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkpoint_answers_id_seq OWNER TO postgres;

--
-- TOC entry 4409 (class 0 OID 0)
-- Dependencies: 231
-- Name: checkpoint_answers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checkpoint_answers_id_seq OWNED BY public.checkpoint_answers.id;


--
-- TOC entry 234 (class 1259 OID 34048)
-- Name: checkpoint_hints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkpoint_hints (
    id integer NOT NULL,
    checkpoint_id integer NOT NULL,
    hint_order smallint NOT NULL,
    text text NOT NULL
);


ALTER TABLE public.checkpoint_hints OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 34047)
-- Name: checkpoint_hints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checkpoint_hints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkpoint_hints_id_seq OWNER TO postgres;

--
-- TOC entry 4410 (class 0 OID 0)
-- Dependencies: 233
-- Name: checkpoint_hints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checkpoint_hints_id_seq OWNED BY public.checkpoint_hints.id;


--
-- TOC entry 230 (class 1259 OID 34016)
-- Name: checkpoints; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.checkpoints (
    id integer NOT NULL,
    quest_id uuid NOT NULL,
    "order" smallint NOT NULL,
    title character varying(255) NOT NULL,
    task text NOT NULL,
    question_type public.checkpointquestiontypeenum NOT NULL,
    address character varying(255),
    point_rules text NOT NULL,
    lat numeric(11,8) NOT NULL,
    lng numeric(11,8) NOT NULL,
    point public.geography(Point,4326)
);


ALTER TABLE public.checkpoints OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 34015)
-- Name: checkpoints_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.checkpoints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.checkpoints_id_seq OWNER TO postgres;

--
-- TOC entry 4411 (class 0 OID 0)
-- Dependencies: 229
-- Name: checkpoints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.checkpoints_id_seq OWNED BY public.checkpoints.id;


--
-- TOC entry 228 (class 1259 OID 17598)
-- Name: files; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.files (
    id uuid NOT NULL,
    path character varying NOT NULL
);


ALTER TABLE public.files OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 34104)
-- Name: quest_session_checkpoint_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quest_session_checkpoint_attempts (
    id integer NOT NULL,
    session_id uuid NOT NULL,
    checkpoint_id integer NOT NULL,
    attempt_text text,
    selected_answer_id integer,
    is_correct boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quest_session_checkpoint_attempts OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 34103)
-- Name: quest_session_checkpoint_attempts_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quest_session_checkpoint_attempts_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.quest_session_checkpoint_attempts_id_seq OWNER TO postgres;

--
-- TOC entry 4412 (class 0 OID 0)
-- Dependencies: 236
-- Name: quest_session_checkpoint_attempts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quest_session_checkpoint_attempts_id_seq OWNED BY public.quest_session_checkpoint_attempts.id;


--
-- TOC entry 235 (class 1259 OID 34077)
-- Name: quest_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quest_sessions (
    id uuid NOT NULL,
    quest_id uuid NOT NULL,
    mode public.questsessionmodeenum NOT NULL,
    status public.questsessionstatusenum NOT NULL,
    owner_user_id uuid,
    owner_team_id uuid,
    current_checkpoint_order integer NOT NULL,
    total_checkpoints integer NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone
);


ALTER TABLE public.quest_sessions OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 17559)
-- Name: quests; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quests (
    id uuid NOT NULL,
    author_id uuid NOT NULL,
    title character varying(120) NOT NULL,
    description text NOT NULL,
    city_district character varying(120) NOT NULL,
    cover_file character varying,
    difficulty smallint NOT NULL,
    duration_minutes integer NOT NULL,
    rules_warning text,
    status public.queststatusenum NOT NULL,
    rejection_reason text,
    start_lat double precision,
    start_lng double precision,
    start_point public.geography(Point,4326),
    published_at timestamp with time zone,
    archived_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    category character varying(100),
    age_group_id uuid,
    route_geometry json,
    client_extra json,
    CONSTRAINT check_quest_description_min_len CHECK ((char_length(description) >= 30)),
    CONSTRAINT check_quest_difficulty_range CHECK (((difficulty >= 1) AND (difficulty <= 5))),
    CONSTRAINT check_quest_duration_positive CHECK ((duration_minutes > 0)),
    CONSTRAINT check_quest_title_min_len CHECK ((char_length((title)::text) >= 5))
);


ALTER TABLE public.quests OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 17496)
-- Name: refresh_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.refresh_session (
    refresh_token uuid NOT NULL,
    access_token character varying NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.refresh_session OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 17527)
-- Name: team_members; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.team_members (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    team_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.team_members OWNER TO postgres;

--
-- TOC entry 225 (class 1259 OID 17511)
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.teams (
    id uuid NOT NULL,
    owner_id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(100) NOT NULL,
    join_code character varying(12) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 17481)
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id uuid NOT NULL,
    username character varying(100) NOT NULL,
    hashed_password character varying(1024) NOT NULL,
    age_group_id uuid NOT NULL,
    role public.userroleenum NOT NULL,
    is_deleted boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    nickname character varying(100) NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- TOC entry 4150 (class 2604 OID 34035)
-- Name: checkpoint_answers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkpoint_answers ALTER COLUMN id SET DEFAULT nextval('public.checkpoint_answers_id_seq'::regclass);


--
-- TOC entry 4152 (class 2604 OID 34051)
-- Name: checkpoint_hints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkpoint_hints ALTER COLUMN id SET DEFAULT nextval('public.checkpoint_hints_id_seq'::regclass);


--
-- TOC entry 4149 (class 2604 OID 34019)
-- Name: checkpoints id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.checkpoints ALTER COLUMN id SET DEFAULT nextval('public.checkpoints_id_seq'::regclass);


--
-- TOC entry 4154 (class 2604 OID 34107)
-- Name: quest_session_checkpoint_attempts id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quest_session_checkpoint_attempts ALTER COLUMN id SET DEFAULT nextval('public.quest_session_checkpoint_attempts_id_seq'::regclass);


--
-- TOC entry 4388 (class 0 OID 17467)
-- Dependencies: 222
-- Data for Name: age_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.age_groups (id, name) FROM stdin;
5705a746-c2fc-4cbe-98d2-a9e5c076f89b	14-15
\.


--
-- TOC entry 4387 (class 0 OID 16384)
-- Dependencies: 216
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
2b7c9d4e5f6a
\.


--
-- TOC entry 4398 (class 0 OID 34032)
-- Dependencies: 232
-- Data for Name: checkpoint_answers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkpoint_answers (id, checkpoint_id, option_order, answer_text, is_correct) FROM stdin;
1	1	1	2	f
2	1	2	4	t
3	1	3	6	f
4	1	4	8	f
5	2	1	Синий	f
6	2	2	Зелёный	t
7	2	3	Красный	f
8	2	4	Белый	f
9	3	1	Юрий Долгорукий	f
10	3	2	Георгий Победоносец	t
11	3	3	Александр Невский	f
12	3	4	Илья Муромец	f
13	4	\N	code1	t
14	5	\N	code2	t
15	6	\N	code3	t
16	7	\N	code1	t
17	8	\N	code2	t
18	9	1	Вариант 1	f
19	9	2	Вариант 2	f
20	9	3	Вариант 3	t
21	9	4	Вариант 4	f
22	10	1	Вариант 1	f
23	10	2	Вариант 2	t
24	10	3	Вариант 3	f
25	10	4	Вариант 4	f
26	11	\N	code5	t
27	12	1	Вариант 1	t
28	12	2	Вариант 2	f
29	12	3	Вариант 3	f
30	12	4	Вариант 4	f
31	13	1	Вариант 1	t
32	13	2	Вариант 2	f
33	13	3	Вариант 3	f
34	13	4	Вариант 4	f
35	14	1	Вариант 1	f
36	14	2	Вариант 2	f
37	14	3	Вариант 3	t
38	14	4	Вариант 4	f
39	15	\N	code1	t
40	16	1	Вариант 1	f
41	16	2	Вариант 2	f
42	16	3	Вариант 3	t
43	16	4	Вариант 4	f
44	17	1	Вариант 1	f
45	17	2	Вариант 2	f
46	17	3	Вариант 3	t
47	17	4	Вариант 4	f
48	18	\N	code4	t
49	19	\N	code1	t
50	20	1	Вариант 1	f
51	20	2	Вариант 2	f
52	20	3	Вариант 3	f
53	20	4	Вариант 4	t
54	21	1	Вариант 1	f
55	21	2	Вариант 2	t
56	21	3	Вариант 3	f
57	21	4	Вариант 4	f
58	22	1	Вариант 1	t
59	22	2	Вариант 2	f
60	22	3	Вариант 3	f
61	22	4	Вариант 4	f
62	23	1	Вариант 1	f
63	23	2	Вариант 2	t
64	23	3	Вариант 3	f
65	23	4	Вариант 4	f
66	24	1	Вариант 1	f
67	24	2	Вариант 2	f
68	24	3	Вариант 3	f
69	24	4	Вариант 4	t
70	25	1	Вариант 1	f
71	25	2	Вариант 2	t
72	25	3	Вариант 3	f
73	25	4	Вариант 4	f
74	26	1	Вариант 1	f
75	26	2	Вариант 2	t
76	26	3	Вариант 3	f
77	26	4	Вариант 4	f
78	27	\N	code5	t
79	28	1	Вариант 1	f
80	28	2	Вариант 2	f
81	28	3	Вариант 3	f
82	28	4	Вариант 4	t
83	29	1	Вариант 1	f
84	29	2	Вариант 2	f
85	29	3	Вариант 3	t
86	29	4	Вариант 4	f
87	30	\N	code1	t
88	31	\N	code2	t
89	32	1	Вариант 1	t
90	32	2	Вариант 2	f
91	32	3	Вариант 3	f
92	32	4	Вариант 4	f
93	33	1	Вариант 1	f
94	33	2	Вариант 2	f
95	33	3	Вариант 3	t
96	33	4	Вариант 4	f
97	34	\N	code2	t
98	35	1	Вариант 1	f
99	35	2	Вариант 2	f
100	35	3	Вариант 3	f
101	35	4	Вариант 4	t
102	36	1	Вариант 1	f
103	36	2	Вариант 2	t
104	36	3	Вариант 3	f
105	36	4	Вариант 4	f
106	37	\N	code2	t
107	38	1	Вариант 1	f
108	38	2	Вариант 2	t
109	38	3	Вариант 3	f
110	38	4	Вариант 4	f
111	39	\N	code1	t
112	40	1	Вариант 1	f
113	40	2	Вариант 2	f
114	40	3	Вариант 3	t
115	40	4	Вариант 4	f
116	41	\N	code3	t
117	42	\N	code1	t
118	43	\N	code2	t
119	44	1	Вариант 1	f
120	44	2	Вариант 2	t
121	44	3	Вариант 3	f
122	44	4	Вариант 4	f
123	45	1	Вариант 1	f
124	45	2	Вариант 2	f
125	45	3	Вариант 3	t
126	45	4	Вариант 4	f
127	46	1	Вариант 1	f
128	46	2	Вариант 2	f
129	46	3	Вариант 3	f
130	46	4	Вариант 4	t
131	47	\N	code3	t
132	48	\N	code4	t
133	49	\N	code5	t
134	50	\N	code1	t
135	51	\N	code2	t
136	52	\N	code3	t
137	53	\N	code1	t
138	54	1	Вариант 1	f
139	54	2	Вариант 2	t
140	54	3	Вариант 3	f
141	54	4	Вариант 4	f
142	55	1	Вариант 1	f
143	55	2	Вариант 2	f
144	55	3	Вариант 3	f
145	55	4	Вариант 4	t
146	56	\N	code4	t
147	57	\N	code5	t
148	58	\N	code6	t
149	59	1	Вариант 1	f
150	59	2	Вариант 2	f
151	59	3	Вариант 3	t
152	59	4	Вариант 4	f
153	60	\N	code1	t
154	61	\N	code2	t
155	62	\N	code3	t
156	63	\N	code4	t
157	64	1	Вариант 1	f
158	64	2	Вариант 2	t
159	64	3	Вариант 3	f
160	64	4	Вариант 4	f
\.


--
-- TOC entry 4400 (class 0 OID 34048)
-- Dependencies: 234
-- Data for Name: checkpoint_hints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkpoint_hints (id, checkpoint_id, hint_order, text) FROM stdin;
1	1	1	Смотрите выше второго этажа.
2	1	2	Фигуры расположены симметрично.
3	1	3	Посчитайте только целые фигуры.
4	2	1	Ищите фонарь над аркой.
5	2	2	Цвет тёмный, но не чёрный.
6	2	3	Это классический оттенок патины.
7	3	1	Это всадник.
8	3	2	Он поражает копьём.
9	3	3	Сюжет связан со святым.
10	4	1	Подсказка 1.1
11	4	2	Подсказка 1.2
12	4	3	Подсказка 1.3
13	5	1	Подсказка 2.1
14	5	2	Подсказка 2.2
15	5	3	Подсказка 2.3
16	6	1	Подсказка 3.1
17	6	2	Подсказка 3.2
18	6	3	Подсказка 3.3
19	7	1	Подсказка 1.1
20	7	2	Подсказка 1.2
21	7	3	Подсказка 1.3
22	8	1	Подсказка 2.1
23	8	2	Подсказка 2.2
24	8	3	Подсказка 2.3
25	9	1	Подсказка 3.1
26	9	2	Подсказка 3.2
27	9	3	Подсказка 3.3
28	10	1	Подсказка 4.1
29	10	2	Подсказка 4.2
30	10	3	Подсказка 4.3
31	11	1	Подсказка 5.1
32	11	2	Подсказка 5.2
33	11	3	Подсказка 5.3
34	12	1	Подсказка 1.1
35	12	2	Подсказка 1.2
36	12	3	Подсказка 1.3
37	13	1	Подсказка 2.1
38	13	2	Подсказка 2.2
39	13	3	Подсказка 2.3
40	14	1	Подсказка 3.1
41	14	2	Подсказка 3.2
42	14	3	Подсказка 3.3
43	15	1	Подсказка 1.1
44	15	2	Подсказка 1.2
45	15	3	Подсказка 1.3
46	16	1	Подсказка 2.1
47	16	2	Подсказка 2.2
48	16	3	Подсказка 2.3
49	17	1	Подсказка 3.1
50	17	2	Подсказка 3.2
51	17	3	Подсказка 3.3
52	18	1	Подсказка 4.1
53	18	2	Подсказка 4.2
54	18	3	Подсказка 4.3
55	19	1	Подсказка 1.1
56	19	2	Подсказка 1.2
57	19	3	Подсказка 1.3
58	20	1	Подсказка 2.1
59	20	2	Подсказка 2.2
60	20	3	Подсказка 2.3
61	21	1	Подсказка 3.1
62	21	2	Подсказка 3.2
63	21	3	Подсказка 3.3
64	22	1	Подсказка 4.1
65	22	2	Подсказка 4.2
66	22	3	Подсказка 4.3
67	23	1	Подсказка 1.1
68	23	2	Подсказка 1.2
69	23	3	Подсказка 1.3
70	24	1	Подсказка 2.1
71	24	2	Подсказка 2.2
72	24	3	Подсказка 2.3
73	25	1	Подсказка 3.1
74	25	2	Подсказка 3.2
75	25	3	Подсказка 3.3
76	26	1	Подсказка 4.1
77	26	2	Подсказка 4.2
78	26	3	Подсказка 4.3
79	27	1	Подсказка 5.1
80	27	2	Подсказка 5.2
81	27	3	Подсказка 5.3
82	28	1	Подсказка 6.1
83	28	2	Подсказка 6.2
84	28	3	Подсказка 6.3
85	29	1	Подсказка 7.1
86	29	2	Подсказка 7.2
87	29	3	Подсказка 7.3
88	30	1	Подсказка 1.1
89	30	2	Подсказка 1.2
90	30	3	Подсказка 1.3
91	31	1	Подсказка 2.1
92	31	2	Подсказка 2.2
93	31	3	Подсказка 2.3
94	32	1	Подсказка 3.1
95	32	2	Подсказка 3.2
96	32	3	Подсказка 3.3
97	33	1	Подсказка 1.1
98	33	2	Подсказка 1.2
99	33	3	Подсказка 1.3
100	34	1	Подсказка 2.1
101	34	2	Подсказка 2.2
102	34	3	Подсказка 2.3
103	35	1	Подсказка 3.1
104	35	2	Подсказка 3.2
105	35	3	Подсказка 3.3
106	36	1	Подсказка 1.1
107	36	2	Подсказка 1.2
108	36	3	Подсказка 1.3
109	37	1	Подсказка 2.1
110	37	2	Подсказка 2.2
111	37	3	Подсказка 2.3
112	38	1	Подсказка 3.1
113	38	2	Подсказка 3.2
114	38	3	Подсказка 3.3
115	39	1	Подсказка 1.1
116	39	2	Подсказка 1.2
117	39	3	Подсказка 1.3
118	40	1	Подсказка 2.1
119	40	2	Подсказка 2.2
120	40	3	Подсказка 2.3
121	41	1	Подсказка 3.1
122	41	2	Подсказка 3.2
123	41	3	Подсказка 3.3
124	42	1	Подсказка 1.1
125	42	2	Подсказка 1.2
126	42	3	Подсказка 1.3
127	43	1	Подсказка 2.1
128	43	2	Подсказка 2.2
129	43	3	Подсказка 2.3
130	44	1	Подсказка 3.1
131	44	2	Подсказка 3.2
132	44	3	Подсказка 3.3
133	45	1	Подсказка 1.1
134	45	2	Подсказка 1.2
135	45	3	Подсказка 1.3
136	46	1	Подсказка 2.1
137	46	2	Подсказка 2.2
138	46	3	Подсказка 2.3
139	47	1	Подсказка 3.1
140	47	2	Подсказка 3.2
141	47	3	Подсказка 3.3
142	48	1	Подсказка 4.1
143	48	2	Подсказка 4.2
144	48	3	Подсказка 4.3
145	49	1	Подсказка 5.1
146	49	2	Подсказка 5.2
147	49	3	Подсказка 5.3
148	50	1	Подсказка 1.1
149	50	2	Подсказка 1.2
150	50	3	Подсказка 1.3
151	51	1	Подсказка 2.1
152	51	2	Подсказка 2.2
153	51	3	Подсказка 2.3
154	52	1	Подсказка 3.1
155	52	2	Подсказка 3.2
156	52	3	Подсказка 3.3
157	53	1	Подсказка 1.1
158	53	2	Подсказка 1.2
159	53	3	Подсказка 1.3
160	54	1	Подсказка 2.1
161	54	2	Подсказка 2.2
162	54	3	Подсказка 2.3
163	55	1	Подсказка 3.1
164	55	2	Подсказка 3.2
165	55	3	Подсказка 3.3
166	56	1	Подсказка 4.1
167	56	2	Подсказка 4.2
168	56	3	Подсказка 4.3
169	57	1	Подсказка 5.1
170	57	2	Подсказка 5.2
171	57	3	Подсказка 5.3
172	58	1	Подсказка 6.1
173	58	2	Подсказка 6.2
174	58	3	Подсказка 6.3
175	59	1	Подсказка 7.1
176	59	2	Подсказка 7.2
177	59	3	Подсказка 7.3
178	60	1	Подсказка 1.1
179	60	2	Подсказка 1.2
180	60	3	Подсказка 1.3
181	61	1	Подсказка 2.1
182	61	2	Подсказка 2.2
183	61	3	Подсказка 2.3
184	62	1	Подсказка 3.1
185	62	2	Подсказка 3.2
186	62	3	Подсказка 3.3
187	63	1	Подсказка 4.1
188	63	2	Подсказка 4.2
189	63	3	Подсказка 4.3
190	64	1	Подсказка 5.1
191	64	2	Подсказка 5.2
192	64	3	Подсказка 5.3
\.


--
-- TOC entry 4396 (class 0 OID 34016)
-- Dependencies: 230
-- Data for Name: checkpoints; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.checkpoints (id, quest_id, "order", title, task, question_type, address, point_rules, lat, lng, point) FROM stdin;
1	f735f37a-14c5-4963-9ff6-2f74729455f0	1	Дом с рыцарями	Сколько рыцарских фигур видно на фасаде здания?	CHOICE	ул. Арбат, 35	Не заходите на проезжую часть.	55.75220000	37.59290000	0101000020E610000032E6AE25E4CB42408E06F01648E04B40
2	f735f37a-14c5-4963-9ff6-2f74729455f0	2	Фонарь времени	Какого цвета декоративный фонарь у входа?	CHOICE	пер. Сивцев Вражек, 12	Не мешайте проходу жителей.	55.74960000	37.58680000	0101000020E61000007AA52C431CCB4240728A8EE4F2DF4B40
3	f735f37a-14c5-4963-9ff6-2f74729455f0	3	Московский герб	Кто изображён на гербе над входом?	CHOICE	Староконюшенный пер., 5	Соблюдайте тишину во дворе.	55.74810000	37.58150000	0101000020E6100000DF4F8D976ECA42409D11A5BDC1DF4B40
4	1b8ded84-b52d-49a7-a9d7-64ef8bfed305	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.75806798	37.59688718	0101000020E61000000E9198CC66CC4240C20A1E5F08E14B40
5	1b8ded84-b52d-49a7-a9d7-64ef8bfed305	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.75906798	37.59808718	0101000020E6100000B9F1EC1E8ECC4240A6B0B92329E14B40
6	1b8ded84-b52d-49a7-a9d7-64ef8bfed305	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.76006798	37.59928718	0101000020E610000063524171B5CC4240895655E849E14B40
7	6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.75508075	37.58364980	0101000020E61000009A106709B5CA4240B7BE697CA6E04B40
8	6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.75608075	37.58484980	0101000020E61000004571BB5BDCCA42409B640541C7E04B40
9	6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.75708075	37.58604980	0101000020E6100000EFD10FAE03CB42407E0AA105E8E04B40
10	6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	4	Точка 4	Задание для точки 4. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 14	Соблюдайте ПДД и не мешайте прохожим.	55.75808075	37.58724980	0101000020E61000009A3264002BCB424061B03CCA08E14B40
11	6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	5	Точка 5	Задание для точки 5. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 15	Соблюдайте ПДД и не мешайте прохожим.	55.75908075	37.58844980	0101000020E61000004493B85252CB42404556D88E29E14B40
12	5edea24b-ce53-4747-8887-3c4d11cf6356	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.73508841	37.57639709	0101000020E610000026E14161C7C942405D96866017DE4B40
13	5edea24b-ce53-4747-8887-3c4d11cf6356	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.73608841	37.57759709	0101000020E6100000D14196B3EEC94240413C222538DE4B40
14	5edea24b-ce53-4747-8887-3c4d11cf6356	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.73708841	37.57879709	0101000020E61000007BA2EA0516CA424024E2BDE958DE4B40
15	0a41f792-45b8-44ef-a32e-d8507e4ae599	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.73869154	37.56398221	0101000020E6100000030CA59130C84240A5D1CA718DDE4B40
16	0a41f792-45b8-44ef-a32e-d8507e4ae599	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.73969154	37.56518221	0101000020E6100000AE6CF9E357C8424089776636AEDE4B40
17	0a41f792-45b8-44ef-a32e-d8507e4ae599	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.74069154	37.56638221	0101000020E610000058CD4D367FC842406C1D02FBCEDE4B40
18	0a41f792-45b8-44ef-a32e-d8507e4ae599	4	Точка 4	Задание для точки 4. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 14	Соблюдайте ПДД и не мешайте прохожим.	55.74169154	37.56758221	0101000020E6100000032EA288A6C842404FC39DBFEFDE4B40
19	e5152c54-0a1b-4591-90bb-83511854ce78	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.74521083	37.58800701	0101000020E6100000726348D043CB42404B76831163DF4B40
20	e5152c54-0a1b-4591-90bb-83511854ce78	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.74621083	37.58920701	0101000020E61000001DC49C226BCB42402F1C1FD683DF4B40
21	e5152c54-0a1b-4591-90bb-83511854ce78	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.74721083	37.59040701	0101000020E6100000C724F17492CB424012C2BA9AA4DF4B40
22	e5152c54-0a1b-4591-90bb-83511854ce78	4	Точка 4	Задание для точки 4. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 14	Соблюдайте ПДД и не мешайте прохожим.	55.74821083	37.59160701	0101000020E6100000728545C7B9CB4240F567565FC5DF4B40
23	bbe7ded7-7754-4f81-ab33-09a2e5d4a0b8	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.76387210	37.59340183	0101000020E6100000BFFA5A97F4CB424011FDA38FC6E14B40
24	bbe7ded7-7754-4f81-ab33-09a2e5d4a0b8	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.76487210	37.59460183	0101000020E61000006A5BAFE91BCC4240F5A23F54E7E14B40
25	bbe7ded7-7754-4f81-ab33-09a2e5d4a0b8	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.76587210	37.59580183	0101000020E610000014BC033C43CC4240D848DB1808E24B40
26	bbe7ded7-7754-4f81-ab33-09a2e5d4a0b8	4	Точка 4	Задание для точки 4. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 14	Соблюдайте ПДД и не мешайте прохожим.	55.76687210	37.59700183	0101000020E6100000BF1C588E6ACC4240BBEE76DD28E24B40
27	bbe7ded7-7754-4f81-ab33-09a2e5d4a0b8	5	Точка 5	Задание для точки 5. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 15	Соблюдайте ПДД и не мешайте прохожим.	55.76787210	37.59820183	0101000020E6100000697DACE091CC42409F9412A249E24B40
28	bbe7ded7-7754-4f81-ab33-09a2e5d4a0b8	6	Точка 6	Задание для точки 6. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 16	Соблюдайте ПДД и не мешайте прохожим.	55.76887210	37.59940183	0101000020E610000013DE0033B9CC4240823AAE666AE24B40
29	bbe7ded7-7754-4f81-ab33-09a2e5d4a0b8	7	Точка 7	Задание для точки 7. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 17	Соблюдайте ПДД и не мешайте прохожим.	55.76987210	37.60060183	0101000020E6100000BE3E5585E0CC424065E0492B8BE24B40
30	1faab5fa-1443-49b4-bde1-6f4f41b44262	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.77089303	37.56673327	0101000020E6100000E7A93DB78AC84240B9AF729FACE24B40
31	1faab5fa-1443-49b4-bde1-6f4f41b44262	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.77189303	37.56793327	0101000020E6100000920A9209B2C842409D550E64CDE24B40
32	1faab5fa-1443-49b4-bde1-6f4f41b44262	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.77289303	37.56913327	0101000020E61000003C6BE65BD9C8424080FBA928EEE24B40
33	266614af-0bdd-429a-8598-9526e3d81f64	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.74626477	37.60104486	0101000020E6100000F346AE09EFCC424014CAA19A85DF4B40
34	266614af-0bdd-429a-8598-9526e3d81f64	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.74726477	37.60224486	0101000020E61000009EA7025C16CD4240F86F3D5FA6DF4B40
35	266614af-0bdd-429a-8598-9526e3d81f64	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.74826477	37.60344486	0101000020E6100000480857AE3DCD4240DB15D923C7DF4B40
36	f0452efc-9bf4-4f3c-8337-944090546342	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.74914895	37.59935264	0101000020E61000004A8F5396B7CC4240424ADC1CE4DF4B40
37	f0452efc-9bf4-4f3c-8337-944090546342	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.75014895	37.60055264	0101000020E6100000F5EFA7E8DECC424026F077E104E04B40
38	f0452efc-9bf4-4f3c-8337-944090546342	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.75114895	37.60175264	0101000020E61000009F50FC3A06CD4240099613A625E04B40
39	a8ea1359-6204-4d81-b8ed-473591035f90	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.76913999	37.59809736	0101000020E6100000E06F53748ECC4240A858DF2D73E24B40
40	a8ea1359-6204-4d81-b8ed-473591035f90	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.77013999	37.59929736	0101000020E61000008BD0A7C6B5CC42408CFE7AF293E24B40
41	a8ea1359-6204-4d81-b8ed-473591035f90	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.77113999	37.60049736	0101000020E61000003531FC18DDCC42406FA416B7B4E24B40
42	0506fa01-bcbe-4282-b6fc-397f4bc8b670	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.74063486	37.58389428	0101000020E6100000A79F350CBDCA42400FEE8A1FCDDE4B40
43	0506fa01-bcbe-4282-b6fc-397f4bc8b670	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.74163486	37.58509428	0101000020E610000052008A5EE4CA4240F39326E4EDDE4B40
44	0506fa01-bcbe-4282-b6fc-397f4bc8b670	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.74263486	37.58629428	0101000020E6100000FC60DEB00BCB4240D639C2A80EDF4B40
45	4942b649-816c-449c-8f8e-8b99c62bd5ce	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.75210695	37.58546376	0101000020E61000002602F479F0CA4240E8E2630A45E04B40
46	4942b649-816c-449c-8f8e-8b99c62bd5ce	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.75310695	37.58666376	0101000020E6100000D16248CC17CB4240CC88FFCE65E04B40
47	4942b649-816c-449c-8f8e-8b99c62bd5ce	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.75410695	37.58786376	0101000020E61000007BC39C1E3FCB4240AF2E9B9386E04B40
48	4942b649-816c-449c-8f8e-8b99c62bd5ce	4	Точка 4	Задание для точки 4. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 14	Соблюдайте ПДД и не мешайте прохожим.	55.75510695	37.58906376	0101000020E61000002624F17066CB424092D43658A7E04B40
49	4942b649-816c-449c-8f8e-8b99c62bd5ce	5	Точка 5	Задание для точки 5. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 15	Соблюдайте ПДД и не мешайте прохожим.	55.75610695	37.59026376	0101000020E6100000D08445C38DCB4240767AD21CC8E04B40
50	f2dccc11-db76-4882-bdfa-5877e182e855	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.74452342	37.58473235	0101000020E6100000425F7582D8CA42406A57238B4CDF4B40
51	f2dccc11-db76-4882-bdfa-5877e182e855	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.74552342	37.58593235	0101000020E6100000EDBFC9D4FFCA42404EFDBE4F6DDF4B40
52	f2dccc11-db76-4882-bdfa-5877e182e855	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.74652342	37.58713235	0101000020E610000097201E2727CB424031A35A148EDF4B40
53	f36704ea-1e2f-47da-814c-10921294ff0e	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.76538542	37.56403429	0101000020E61000004344974632C84240AA4C3926F8E14B40
54	f36704ea-1e2f-47da-814c-10921294ff0e	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.76638542	37.56523429	0101000020E6100000EEA4EB9859C842408EF2D4EA18E24B40
55	f36704ea-1e2f-47da-814c-10921294ff0e	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.76738542	37.56643429	0101000020E6100000980540EB80C84240719870AF39E24B40
56	f36704ea-1e2f-47da-814c-10921294ff0e	4	Точка 4	Задание для точки 4. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 14	Соблюдайте ПДД и не мешайте прохожим.	55.76838542	37.56763429	0101000020E61000004366943DA8C84240543E0C745AE24B40
57	f36704ea-1e2f-47da-814c-10921294ff0e	5	Точка 5	Задание для точки 5. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 15	Соблюдайте ПДД и не мешайте прохожим.	55.76938542	37.56883429	0101000020E6100000EDC6E88FCFC8424038E4A7387BE24B40
58	f36704ea-1e2f-47da-814c-10921294ff0e	6	Точка 6	Задание для точки 6. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 16	Соблюдайте ПДД и не мешайте прохожим.	55.77038542	37.57003429	0101000020E610000097273DE2F6C842401B8A43FD9BE24B40
59	f36704ea-1e2f-47da-814c-10921294ff0e	7	Точка 7	Задание для точки 7. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 17	Соблюдайте ПДД и не мешайте прохожим.	55.77138542	37.57123429	0101000020E6100000428891341EC94240FE2FDFC1BCE24B40
60	f6a725fc-c462-4593-acda-ba51a83fcbb3	1	Точка 1	Задание для точки 1. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 11	Соблюдайте ПДД и не мешайте прохожим.	55.74744409	37.59575347	0101000020E610000098EC52A641CC4240904E7B3FACDF4B40
61	f6a725fc-c462-4593-acda-ba51a83fcbb3	2	Точка 2	Задание для точки 2. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 12	Соблюдайте ПДД и не мешайте прохожим.	55.74844409	37.59695347	0101000020E6100000434DA7F868CC424074F41604CDDF4B40
62	f6a725fc-c462-4593-acda-ba51a83fcbb3	3	Точка 3	Задание для точки 3. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 13	Соблюдайте ПДД и не мешайте прохожим.	55.74944409	37.59815347	0101000020E6100000EDADFB4A90CC4240579AB2C8EDDF4B40
63	f6a725fc-c462-4593-acda-ba51a83fcbb3	4	Точка 4	Задание для точки 4. Найдите ответ рядом с координатами.	CODE	ул. Арбат, 14	Соблюдайте ПДД и не мешайте прохожим.	55.75044409	37.59935347	0101000020E6100000980E509DB7CC42403A404E8D0EE04B40
64	f6a725fc-c462-4593-acda-ba51a83fcbb3	5	Точка 5	Задание для точки 5. Найдите ответ рядом с координатами.	CHOICE	ул. Арбат, 15	Соблюдайте ПДД и не мешайте прохожим.	55.75144409	37.60055347	0101000020E6100000426FA4EFDECC42401EE6E9512FE04B40
\.


--
-- TOC entry 4394 (class 0 OID 17598)
-- Dependencies: 228
-- Data for Name: files; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.files (id, path) FROM stdin;
\.


--
-- TOC entry 4403 (class 0 OID 34104)
-- Dependencies: 237
-- Data for Name: quest_session_checkpoint_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quest_session_checkpoint_attempts (id, session_id, checkpoint_id, attempt_text, selected_answer_id, is_correct, created_at) FROM stdin;
1	b1b723dc-d562-4b3c-955a-db99ff30e652	1	1	1	f	2026-04-29 02:35:46.803188+00
2	b1b723dc-d562-4b3c-955a-db99ff30e652	1	1	2	t	2026-04-29 02:36:37.095489+00
3	9db1312d-252e-4eac-acbc-9c7c3ee20c55	30	demo	\N	t	2026-04-29 05:15:24.341777+00
4	9db1312d-252e-4eac-acbc-9c7c3ee20c55	31	demo	\N	t	2026-04-29 05:15:24.341777+00
5	9db1312d-252e-4eac-acbc-9c7c3ee20c55	32	demo	\N	t	2026-04-29 05:15:24.341777+00
6	69b72493-88ae-4325-a09c-3d22f44f8d9e	33	demo	\N	t	2026-04-29 05:15:24.341777+00
7	69b72493-88ae-4325-a09c-3d22f44f8d9e	34	demo	\N	t	2026-04-29 05:15:24.341777+00
8	69b72493-88ae-4325-a09c-3d22f44f8d9e	35	demo	\N	t	2026-04-29 05:15:24.341777+00
9	b0e3a1a2-812f-4092-a63c-7926b030aab2	7	demo	\N	t	2026-04-29 05:15:24.341777+00
10	b0e3a1a2-812f-4092-a63c-7926b030aab2	8	demo	\N	t	2026-04-29 05:15:24.341777+00
11	b0e3a1a2-812f-4092-a63c-7926b030aab2	9	demo	\N	t	2026-04-29 05:15:24.341777+00
12	b0e3a1a2-812f-4092-a63c-7926b030aab2	10	demo	\N	t	2026-04-29 05:15:24.341777+00
13	b0e3a1a2-812f-4092-a63c-7926b030aab2	11	demo	\N	t	2026-04-29 05:15:24.341777+00
14	3830d9a7-647f-4e7a-9201-72b2cd8fed00	15	demo	\N	t	2026-04-29 05:15:24.341777+00
15	3830d9a7-647f-4e7a-9201-72b2cd8fed00	16	demo	\N	t	2026-04-29 05:15:24.341777+00
16	3830d9a7-647f-4e7a-9201-72b2cd8fed00	17	demo	\N	t	2026-04-29 05:15:24.341777+00
17	3830d9a7-647f-4e7a-9201-72b2cd8fed00	18	demo	\N	t	2026-04-29 05:15:24.341777+00
18	e64ff1fd-304d-4d61-8c0e-c23ba70515e2	30	demo	\N	t	2026-04-29 05:15:24.341777+00
19	e64ff1fd-304d-4d61-8c0e-c23ba70515e2	31	demo	\N	t	2026-04-29 05:15:24.341777+00
20	e64ff1fd-304d-4d61-8c0e-c23ba70515e2	32	demo	\N	t	2026-04-29 05:15:24.341777+00
21	1a560c85-8186-46b5-b855-a87cc5ff8748	42	demo	\N	t	2026-04-29 05:15:24.341777+00
22	1a560c85-8186-46b5-b855-a87cc5ff8748	43	demo	\N	t	2026-04-29 05:15:24.341777+00
23	1a560c85-8186-46b5-b855-a87cc5ff8748	44	demo	\N	t	2026-04-29 05:15:24.341777+00
24	cb71c44f-d5e1-408d-b09a-73242c8e00c2	4	demo	\N	t	2026-04-29 05:15:24.341777+00
25	cb71c44f-d5e1-408d-b09a-73242c8e00c2	5	demo	\N	t	2026-04-29 05:15:24.341777+00
26	cb71c44f-d5e1-408d-b09a-73242c8e00c2	6	demo	\N	t	2026-04-29 05:15:24.341777+00
27	1876b97d-fad1-4889-beff-e817fe7c3a93	33	demo	\N	t	2026-04-29 05:15:24.341777+00
28	1876b97d-fad1-4889-beff-e817fe7c3a93	34	demo	\N	t	2026-04-29 05:15:24.341777+00
29	1876b97d-fad1-4889-beff-e817fe7c3a93	35	demo	\N	t	2026-04-29 05:15:24.341777+00
30	9a799194-a2db-4ba0-8a6f-cd2e5e0aa503	7	demo	\N	t	2026-04-29 05:15:24.341777+00
31	9a799194-a2db-4ba0-8a6f-cd2e5e0aa503	8	demo	\N	t	2026-04-29 05:15:24.341777+00
32	9a799194-a2db-4ba0-8a6f-cd2e5e0aa503	9	demo	\N	t	2026-04-29 05:15:24.341777+00
33	9a799194-a2db-4ba0-8a6f-cd2e5e0aa503	10	demo	\N	t	2026-04-29 05:15:24.341777+00
34	9a799194-a2db-4ba0-8a6f-cd2e5e0aa503	11	demo	\N	t	2026-04-29 05:15:24.341777+00
35	d4ac6e37-6844-4348-84cd-511c8867fae3	15	demo	\N	t	2026-04-29 05:15:24.341777+00
36	d4ac6e37-6844-4348-84cd-511c8867fae3	16	demo	\N	t	2026-04-29 05:15:24.341777+00
37	d4ac6e37-6844-4348-84cd-511c8867fae3	17	demo	\N	t	2026-04-29 05:15:24.341777+00
38	d4ac6e37-6844-4348-84cd-511c8867fae3	18	demo	\N	t	2026-04-29 05:15:24.341777+00
39	846f3daa-6a68-412e-ba16-530cf6ec52a3	39	demo	\N	t	2026-04-29 05:15:24.341777+00
40	846f3daa-6a68-412e-ba16-530cf6ec52a3	40	demo	\N	t	2026-04-29 05:15:24.341777+00
41	846f3daa-6a68-412e-ba16-530cf6ec52a3	41	demo	\N	t	2026-04-29 05:15:24.341777+00
42	3a5b2fa9-e5d2-40ed-b937-968f53ddc83e	19	demo	\N	t	2026-04-29 05:15:24.341777+00
43	3a5b2fa9-e5d2-40ed-b937-968f53ddc83e	20	demo	\N	t	2026-04-29 05:15:24.341777+00
44	3a5b2fa9-e5d2-40ed-b937-968f53ddc83e	21	demo	\N	t	2026-04-29 05:15:24.341777+00
45	3a5b2fa9-e5d2-40ed-b937-968f53ddc83e	22	demo	\N	t	2026-04-29 05:15:24.341777+00
46	5ea4267f-11b4-4b6e-abe1-c7e9d793a6fd	33	demo	\N	t	2026-04-29 05:15:24.341777+00
47	5ea4267f-11b4-4b6e-abe1-c7e9d793a6fd	34	demo	\N	t	2026-04-29 05:15:24.341777+00
48	5ea4267f-11b4-4b6e-abe1-c7e9d793a6fd	35	demo	\N	t	2026-04-29 05:15:24.341777+00
49	4e9362cf-e833-4a57-b1e8-9b479560c557	7	demo	\N	t	2026-04-29 05:15:24.341777+00
50	4e9362cf-e833-4a57-b1e8-9b479560c557	8	demo	\N	t	2026-04-29 05:15:24.341777+00
51	4e9362cf-e833-4a57-b1e8-9b479560c557	9	demo	\N	t	2026-04-29 05:15:24.341777+00
52	4e9362cf-e833-4a57-b1e8-9b479560c557	10	demo	\N	t	2026-04-29 05:15:24.341777+00
53	4e9362cf-e833-4a57-b1e8-9b479560c557	11	demo	\N	t	2026-04-29 05:15:24.341777+00
54	ea0f8b70-f006-4939-84b4-02788ee7fbd0	60	demo	\N	t	2026-04-29 05:15:24.341777+00
55	ea0f8b70-f006-4939-84b4-02788ee7fbd0	61	demo	\N	t	2026-04-29 05:15:24.341777+00
56	ea0f8b70-f006-4939-84b4-02788ee7fbd0	62	demo	\N	t	2026-04-29 05:15:24.341777+00
57	ea0f8b70-f006-4939-84b4-02788ee7fbd0	63	demo	\N	t	2026-04-29 05:15:24.341777+00
58	ea0f8b70-f006-4939-84b4-02788ee7fbd0	64	demo	\N	t	2026-04-29 05:15:24.341777+00
59	0c8aacbf-3ec5-4a23-b082-88cf6cf38e05	19	demo	\N	t	2026-04-29 05:15:24.341777+00
60	0c8aacbf-3ec5-4a23-b082-88cf6cf38e05	20	demo	\N	t	2026-04-29 05:15:24.341777+00
61	0c8aacbf-3ec5-4a23-b082-88cf6cf38e05	21	demo	\N	t	2026-04-29 05:15:24.341777+00
62	0c8aacbf-3ec5-4a23-b082-88cf6cf38e05	22	demo	\N	t	2026-04-29 05:15:24.341777+00
63	86a638ac-3a90-4af4-a83e-7c3191c98457	39	demo	\N	t	2026-04-29 05:15:24.341777+00
64	86a638ac-3a90-4af4-a83e-7c3191c98457	40	demo	\N	t	2026-04-29 05:15:24.341777+00
65	86a638ac-3a90-4af4-a83e-7c3191c98457	41	demo	\N	t	2026-04-29 05:15:24.341777+00
66	0fb25c1e-b4d3-40cc-8e52-6a748184c066	60	demo	\N	t	2026-04-29 05:15:24.341777+00
67	0fb25c1e-b4d3-40cc-8e52-6a748184c066	61	demo	\N	t	2026-04-29 05:15:24.341777+00
68	0fb25c1e-b4d3-40cc-8e52-6a748184c066	62	demo	\N	t	2026-04-29 05:15:24.341777+00
69	0fb25c1e-b4d3-40cc-8e52-6a748184c066	63	demo	\N	t	2026-04-29 05:15:24.341777+00
70	0fb25c1e-b4d3-40cc-8e52-6a748184c066	64	demo	\N	t	2026-04-29 05:15:24.341777+00
71	ec480b04-f64a-4225-ab87-e934ce20bcc4	12	demo	\N	t	2026-04-29 05:15:24.341777+00
72	ec480b04-f64a-4225-ab87-e934ce20bcc4	13	demo	\N	t	2026-04-29 05:15:24.341777+00
73	ec480b04-f64a-4225-ab87-e934ce20bcc4	14	demo	\N	t	2026-04-29 05:15:24.341777+00
74	bed7d8c2-cd6e-4b66-9c69-1eb951d88b82	15	demo	\N	t	2026-04-29 05:15:24.341777+00
75	bed7d8c2-cd6e-4b66-9c69-1eb951d88b82	16	demo	\N	t	2026-04-29 05:15:24.341777+00
76	bed7d8c2-cd6e-4b66-9c69-1eb951d88b82	17	demo	\N	t	2026-04-29 05:15:24.341777+00
77	bed7d8c2-cd6e-4b66-9c69-1eb951d88b82	18	demo	\N	t	2026-04-29 05:15:24.341777+00
\.


--
-- TOC entry 4401 (class 0 OID 34077)
-- Dependencies: 235
-- Data for Name: quest_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quest_sessions (id, quest_id, mode, status, owner_user_id, owner_team_id, current_checkpoint_order, total_checkpoints, started_at, completed_at) FROM stdin;
b1b723dc-d562-4b3c-955a-db99ff30e652	f735f37a-14c5-4963-9ff6-2f74729455f0	SOLO	ACTIVE	7e564bea-a947-4479-9419-bf09f4e78e0e	\N	2	3	2026-04-29 02:32:55.93121+00	\N
9db1312d-252e-4eac-acbc-9c7c3ee20c55	1faab5fa-1443-49b4-bde1-6f4f41b44262	TEAM	COMPLETED	\N	a98fdc6e-0a88-43a3-9b9a-3c3ddfb44b79	3	3	2026-04-14 03:42:28.398766+00	2026-04-14 04:26:28.398766+00
69b72493-88ae-4325-a09c-3d22f44f8d9e	266614af-0bdd-429a-8598-9526e3d81f64	TEAM	COMPLETED	\N	78f7d87c-fc80-4655-8ca6-580126d26d01	3	3	2026-04-08 02:27:28.410148+00	2026-04-08 02:55:28.410148+00
b0e3a1a2-812f-4092-a63c-7926b030aab2	6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	TEAM	COMPLETED	\N	2b00987d-a573-4dd9-b99e-554d8ba3c317	5	5	2026-04-15 02:41:28.419491+00	2026-04-15 05:09:28.419491+00
3830d9a7-647f-4e7a-9201-72b2cd8fed00	0a41f792-45b8-44ef-a32e-d8507e4ae599	SOLO	COMPLETED	bab3cfad-0ba5-41da-afa1-e48807528483	\N	4	4	2026-04-23 03:08:28.432066+00	2026-04-23 03:33:28.432066+00
e64ff1fd-304d-4d61-8c0e-c23ba70515e2	1faab5fa-1443-49b4-bde1-6f4f41b44262	SOLO	COMPLETED	77a49617-dcc0-456c-9fd7-df35779f19fc	\N	3	3	2026-04-19 02:57:28.43888+00	2026-04-19 05:44:28.43888+00
1a560c85-8186-46b5-b855-a87cc5ff8748	0506fa01-bcbe-4282-b6fc-397f4bc8b670	SOLO	COMPLETED	dcc84f31-1bcb-4bac-a8eb-bcaefdcd0bb7	\N	3	3	2026-04-22 03:30:28.444556+00	2026-04-22 04:50:28.444556+00
cb71c44f-d5e1-408d-b09a-73242c8e00c2	1b8ded84-b52d-49a7-a9d7-64ef8bfed305	TEAM	COMPLETED	\N	a98fdc6e-0a88-43a3-9b9a-3c3ddfb44b79	3	3	2026-04-27 04:33:28.451813+00	2026-04-27 07:27:28.451813+00
1876b97d-fad1-4889-beff-e817fe7c3a93	266614af-0bdd-429a-8598-9526e3d81f64	TEAM	COMPLETED	\N	78f7d87c-fc80-4655-8ca6-580126d26d01	3	3	2026-04-12 04:25:28.456334+00	2026-04-12 05:37:28.456334+00
9a799194-a2db-4ba0-8a6f-cd2e5e0aa503	6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	TEAM	COMPLETED	\N	2b00987d-a573-4dd9-b99e-554d8ba3c317	5	5	2026-04-16 04:15:28.460505+00	2026-04-16 07:05:28.460505+00
d4ac6e37-6844-4348-84cd-511c8867fae3	0a41f792-45b8-44ef-a32e-d8507e4ae599	TEAM	COMPLETED	\N	78f7d87c-fc80-4655-8ca6-580126d26d01	4	4	2026-04-15 01:57:28.468461+00	2026-04-15 04:51:28.468461+00
846f3daa-6a68-412e-ba16-530cf6ec52a3	a8ea1359-6204-4d81-b8ed-473591035f90	SOLO	COMPLETED	6c86f988-8491-4295-a8ed-69b105f890c2	\N	3	3	2026-04-22 03:25:28.472532+00	2026-04-22 04:51:28.472532+00
3a5b2fa9-e5d2-40ed-b937-968f53ddc83e	e5152c54-0a1b-4591-90bb-83511854ce78	SOLO	COMPLETED	dcc84f31-1bcb-4bac-a8eb-bcaefdcd0bb7	\N	4	4	2026-04-07 02:00:28.476743+00	2026-04-07 03:41:28.476743+00
5ea4267f-11b4-4b6e-abe1-c7e9d793a6fd	266614af-0bdd-429a-8598-9526e3d81f64	SOLO	COMPLETED	e00cf2f3-50e1-41f2-8441-1b3adc47b26d	\N	3	3	2026-04-28 02:48:28.484424+00	2026-04-28 05:37:28.484424+00
4e9362cf-e833-4a57-b1e8-9b479560c557	6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	TEAM	COMPLETED	\N	2b00987d-a573-4dd9-b99e-554d8ba3c317	5	5	2026-04-12 03:38:28.49023+00	2026-04-12 04:36:28.49023+00
ea0f8b70-f006-4939-84b4-02788ee7fbd0	f6a725fc-c462-4593-acda-ba51a83fcbb3	SOLO	COMPLETED	e00cf2f3-50e1-41f2-8441-1b3adc47b26d	\N	5	5	2026-03-31 03:43:28.497078+00	2026-03-31 05:42:28.497078+00
0c8aacbf-3ec5-4a23-b082-88cf6cf38e05	e5152c54-0a1b-4591-90bb-83511854ce78	TEAM	COMPLETED	\N	7520442c-2ade-4a61-a1aa-41dca30c8a37	4	4	2026-04-02 02:26:28.504438+00	2026-04-02 04:08:28.504438+00
86a638ac-3a90-4af4-a83e-7c3191c98457	a8ea1359-6204-4d81-b8ed-473591035f90	TEAM	COMPLETED	\N	a98fdc6e-0a88-43a3-9b9a-3c3ddfb44b79	3	3	2026-03-30 01:56:28.508663+00	2026-03-30 02:47:28.508663+00
0fb25c1e-b4d3-40cc-8e52-6a748184c066	f6a725fc-c462-4593-acda-ba51a83fcbb3	TEAM	COMPLETED	\N	a98fdc6e-0a88-43a3-9b9a-3c3ddfb44b79	5	5	2026-04-25 04:18:28.516256+00	2026-04-25 07:04:28.516256+00
ec480b04-f64a-4225-ab87-e934ce20bcc4	5edea24b-ce53-4747-8887-3c4d11cf6356	SOLO	COMPLETED	6c86f988-8491-4295-a8ed-69b105f890c2	\N	3	3	2026-04-09 03:52:28.520948+00	2026-04-09 05:44:28.520948+00
bed7d8c2-cd6e-4b66-9c69-1eb951d88b82	0a41f792-45b8-44ef-a32e-d8507e4ae599	SOLO	COMPLETED	12aa528e-2b60-4d5a-9e78-85c2f14e8262	\N	4	4	2026-04-13 03:41:28.525162+00	2026-04-13 04:19:28.525162+00
\.


--
-- TOC entry 4393 (class 0 OID 17559)
-- Dependencies: 227
-- Data for Name: quests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quests (id, author_id, title, description, city_district, cover_file, difficulty, duration_minutes, rules_warning, status, rejection_reason, start_lat, start_lng, start_point, published_at, archived_at, created_at, updated_at, category, age_group_id, route_geometry, client_extra) FROM stdin;
f735f37a-14c5-4963-9ff6-2f74729455f0	7e564bea-a947-4479-9419-bf09f4e78e0e	Тайны Арбата	Прогулочный квест по центру с историческими точками, загадками и поиском деталей на фасадах зданий.	Москва, Арбат	arbat_quest.jpg	2	75	Будьте внимательны на переходах. Не выходите на проезжую часть.	MODERATION	\N	55.7522	37.5929	0101000020E610000032E6AE25E4CB42408E06F01648E04B40	\N	\N	2026-04-29 01:22:41.301786+00	2026-04-29 01:22:41.301786+00	История	\N	{"type": "LineString", "coordinates": [[37.5929, 55.7522], [37.5868, 55.7496], [37.5815, 55.7481]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "age_group": {"value": "14plus", "label": "14+"}, "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f", "\\u0410\\u0440\\u0445\\u0438\\u0442\\u0435\\u043a\\u0442\\u0443\\u0440\\u0430"]}
1b8ded84-b52d-49a7-a9d7-64ef8bfed305	e00cf2f3-50e1-41f2-8441-1b3adc47b26d	Demo Quest 01	Демо-квест №1 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	5	90	Следите за безопасностью.	PUBLISHED	\N	55.75706797949692	37.59568718270819	0101000020E61000006430447A3FCC4240DF64829AE7E04B40	2026-04-26 05:15:28.103637+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	История	\N	{"type": "LineString", "coordinates": [[37.59568718270819, 55.75706797949692], [37.59868718270819, 55.75906797949692], [37.60168718270819, 55.76006797949692]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
6c4e657b-ae6b-47bb-92be-a2c84d5c1cf7	12aa528e-2b60-4d5a-9e78-85c2f14e8262	Demo Quest 02	Демо-квест №2 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	2	90	Следите за безопасностью.	PUBLISHED	\N	55.754080749162	37.582449802517544	0101000020E6100000F0AF12B78DCA4240D418CEB785E04B40	2026-03-22 05:15:28.135488+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Урбанистика	\N	{"type": "LineString", "coordinates": [[37.582449802517544, 55.754080749162], [37.585449802517545, 55.756080749162], [37.588449802517545, 55.757080749162]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
5edea24b-ce53-4747-8887-3c4d11cf6356	0761f770-15f2-4b7f-9b84-311316aad0c2	Demo Quest 03	Демо-квест №3 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	3	120	Следите за безопасностью.	PUBLISHED	\N	55.734088411060796	37.57519709202549	0101000020E61000007C80ED0EA0C942407AF0EA9BF6DD4B40	2026-04-12 05:15:28.157332+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Еда	\N	{"type": "LineString", "coordinates": [[37.57519709202549, 55.734088411060796], [37.57819709202549, 55.7360884110608], [37.58119709202549, 55.737088411060796]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
0a41f792-45b8-44ef-a32e-d8507e4ae599	9bb23fd8-a35c-4eab-afd6-7a97c91d5f7d	Demo Quest 04	Демо-квест №4 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	3	45	Следите за безопасностью.	PUBLISHED	\N	55.73769154361027	37.56278220595295	0101000020E610000059AB503F09C84240C22B2FAD6CDE4B40	2026-03-05 05:15:28.172076+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Искусство	\N	{"type": "LineString", "coordinates": [[37.56278220595295, 55.73769154361027], [37.56578220595295, 55.73969154361027], [37.56878220595295, 55.74069154361027]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
e5152c54-0a1b-4591-90bb-83511854ce78	0761f770-15f2-4b7f-9b84-311316aad0c2	Demo Quest 05	Демо-квест №5 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	5	60	Следите за безопасностью.	PUBLISHED	\N	55.7442108280091	37.58680700697511	0101000020E6100000C802F47D1CCB424068D0E74C42DF4B40	2026-03-25 05:15:28.18963+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	История	\N	{"type": "LineString", "coordinates": [[37.58680700697511, 55.7442108280091], [37.58980700697511, 55.746210828009104], [37.59280700697511, 55.7472108280091]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
bbe7ded7-7754-4f81-ab33-09a2e5d4a0b8	f5851baf-a578-4844-aa80-65fe715e3332	Demo Quest 06	Демо-квест №6 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	3	45	Следите за безопасностью.	PUBLISHED	\N	55.76287210376027	37.592201832030845	0101000020E6100000159A0645CDCB42402E5708CBA5E14B40	2026-04-15 05:15:28.206833+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Урбанистика	\N	{"type": "LineString", "coordinates": [[37.592201832030845, 55.76287210376027], [37.595201832030845, 55.764872103760275], [37.598201832030846, 55.76587210376027]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
1faab5fa-1443-49b4-bde1-6f4f41b44262	f5851baf-a578-4844-aa80-65fe715e3332	Demo Quest 07	Демо-квест №7 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	1	45	Следите за безопасностью.	PUBLISHED	\N	55.769893031119565	37.56553326979563	0101000020E61000003D49E96463C84240D609D7DA8BE24B40	2026-03-04 05:15:28.236235+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Урбанистика	\N	{"type": "LineString", "coordinates": [[37.56553326979563, 55.769893031119565], [37.56853326979563, 55.77189303111957], [37.57153326979563, 55.772893031119565]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
266614af-0bdd-429a-8598-9526e3d81f64	5ee081a0-7ae2-463d-9cd4-96718b05f2e7	Demo Quest 08	Демо-квест №8 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	5	45	Следите за безопасностью.	PUBLISHED	\N	55.74526477146026	37.599844855209604	0101000020E610000049E659B7C7CC4240312406D664DF4B40	2026-03-16 05:15:28.250098+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Еда	\N	{"type": "LineString", "coordinates": [[37.599844855209604, 55.74526477146026], [37.602844855209604, 55.747264771460266], [37.605844855209604, 55.74826477146026]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
f0452efc-9bf4-4f3c-8337-944090546342	dcc84f31-1bcb-4bac-a8eb-bcaefdcd0bb7	Demo Quest 09	Демо-квест №9 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	5	60	Следите за безопасностью.	PUBLISHED	\N	55.74814894825317	37.59815263710084	0101000020E6100000A02EFF4390CC42405FA44058C3DF4B40	2026-03-27 05:15:28.269315+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Еда	\N	{"type": "LineString", "coordinates": [[37.59815263710084, 55.74814894825317], [37.60115263710084, 55.75014894825317], [37.60415263710084, 55.75114894825317]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
a8ea1359-6204-4d81-b8ed-473591035f90	12aa528e-2b60-4d5a-9e78-85c2f14e8262	Demo Quest 10	Демо-квест №10 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	5	75	Следите за безопасностью.	PUBLISHED	\N	55.76813998990614	37.59689736322473	0101000020E6100000360FFF2167CC4240C5B2436952E24B40	2026-03-28 05:15:28.283802+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	История	\N	{"type": "LineString", "coordinates": [[37.59689736322473, 55.76813998990614], [37.59989736322473, 55.77013998990614], [37.60289736322473, 55.77113998990614]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
0506fa01-bcbe-4282-b6fc-397f4bc8b670	bab3cfad-0ba5-41da-afa1-e48807528483	Demo Quest 11	Демо-квест №11 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	1	90	Следите за безопасностью.	PUBLISHED	\N	55.73963486369789	37.58269427774756	0101000020E6100000FD3EE1B995CA42402C48EF5AACDE4B40	2026-03-07 05:15:28.297218+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	История	\N	{"type": "LineString", "coordinates": [[37.58269427774756, 55.73963486369789], [37.58569427774756, 55.74163486369789], [37.58869427774756, 55.74263486369789]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
4942b649-816c-449c-8f8e-8b99c62bd5ce	6c86f988-8491-4295-a8ed-69b105f890c2	Demo Quest 12	Демо-квест №12 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	5	60	Следите за безопасностью.	PUBLISHED	\N	55.75110695149673	37.5842637566993	0101000020E61000007CA19F27C9CA4240053DC84524E04B40	2026-03-14 05:15:28.308063+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Искусство	\N	{"type": "LineString", "coordinates": [[37.5842637566993, 55.75110695149673], [37.5872637566993, 55.75310695149673], [37.5902637566993, 55.75410695149673]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
f2dccc11-db76-4882-bdfa-5877e182e855	e00cf2f3-50e1-41f2-8441-1b3adc47b26d	Demo Quest 13	Демо-квест №13 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	5	60	Следите за безопасностью.	PUBLISHED	\N	55.7435234224859	37.58353234873829	0101000020E610000098FE2030B1CA424087B187C62BDF4B40	2026-04-28 05:15:28.328604+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Искусство	\N	{"type": "LineString", "coordinates": [[37.58353234873829, 55.7435234224859], [37.58653234873829, 55.7455234224859], [37.58953234873829, 55.7465234224859]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
f36704ea-1e2f-47da-814c-10921294ff0e	bab3cfad-0ba5-41da-afa1-e48807528483	Demo Quest 14	Демо-квест №14 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	3	90	Следите за безопасностью.	PUBLISHED	\N	55.76438541601015	37.56283429399554	0101000020E610000099E342F40AC84240C7A69D61D7E14B40	2026-04-15 05:15:28.340994+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	Искусство	\N	{"type": "LineString", "coordinates": [[37.56283429399554, 55.76438541601015], [37.56583429399554, 55.76638541601015], [37.56883429399554, 55.76738541601015]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
f6a725fc-c462-4593-acda-ba51a83fcbb3	5ee081a0-7ae2-463d-9cd4-96718b05f2e7	Demo Quest 15	Демо-квест №15 по району Арбат. Подходит для тестов API и фронтенда.	Москва, Арбат	\N	1	45	Следите за безопасностью.	PUBLISHED	\N	55.74644409104199	37.59455346993478	0101000020E6100000EE8BFE531ACC4240ADA8DF7A8BDF4B40	2026-04-03 05:15:28.369816+00	\N	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00	История	\N	{"type": "LineString", "coordinates": [[37.59455346993478, 55.74644409104199], [37.59755346993478, 55.74844409104199], [37.60055346993478, 55.74944409104199]]}	{"city": "\\u041c\\u043e\\u0441\\u043a\\u0432\\u0430", "district": "\\u0410\\u0440\\u0431\\u0430\\u0442", "categories": ["\\u0418\\u0441\\u0442\\u043e\\u0440\\u0438\\u044f"]}
\.


--
-- TOC entry 4390 (class 0 OID 17496)
-- Dependencies: 224
-- Data for Name: refresh_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_session (refresh_token, access_token, expires_at, user_id, created_at, updated_at) FROM stdin;
5e52f21e-6388-4109-819e-9c8cad0ed974	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzM2ODcyNn0.IQLtUQ106ZVMdIu7vb-lQIMmlAI538OTkbVX7SURRVnRJ6e7r3r3Lpuqo8Lv1D_71mCCTTmXFj4vr3MaMLFXP8l6GtDaNdXrsMLESqCB7W0pxfrIRB8RhakDUxzGTguXPEXPddQZriNkMZWzuxgpce22PYWGw7PKOAozJ5jjlGUxfT1BR0Q_dyNfgzScH7z6XXHC0qKbG5FHjAXTvvXnz21M7iT4mOlPl-C-A2I0dwwYuYpA8EPQYRa9VE1FYEAooxCYFFG1pyl57QN0F1hzMmKnNyXtFWv01PSZDyNDG7G0k9IcLhybzS_8W9WCJFwo2CcC2J3g5QVwO0cwXLNZPA	2026-05-28 09:17:06.648496+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-28 09:17:06.285898+00	2026-04-28 09:17:06.285898+00
2a79a2a8-2d92-4065-babf-9145d0953050	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzM2OTY4NH0.I9VmhGC8uTwHcZY-7QWbNV_VkqgTC_kMCUm4vek5Mmv_nUj0wVTP1Ig61v34d6EILyyAK3TUDzRIm-SulTv_Y8DOwdeUeY5ImqgmkHeJs-SqHl54P2r-Di4IiD9Wbq16PkXwjcPQ-FXq8xjCDZwSv7QT67ddRjKBYIRNRpV2iXhccn8d45kbAtPwTuRa_jpZpyqAgUQXEJJGkUKiBUeeYFi-pLwaQKxIUDJIOUx4xj0IAlsQA9XLmhhyTQ0H0zKOVxBONBR5fjrWGwLAEfSgouKnYueJPJ_V3ojCbN7jft84EgwJvMGjVEBh7DUhFOLjBmGK5wSC6LragR6w3P3a8Q	2026-05-28 09:33:04.24275+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-28 09:33:03.901752+00	2026-04-28 09:33:03.901752+00
f303caf0-569a-4700-a19d-9dbae66912c1	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzM5ODE0MX0.EIjqwyldvuXwUCdT1wBZp3waP-AC3DZ7Lgjj9Q4f1WnxMzzic5Cn44QMus-rgFgIPta8lbTMtn3ycjsadT6t-ssFs8jzY3rxXKFgH7qVrufQp8WBDUAPyg1V7Y-JdnQ0uF0h7xKOXeIJCpT0Cf9lENPegPxGOTgHYevbP1Y4vVLpYUOEue13epedj5FeDVl9Kv63b6NZh4ng1SFGoTlCwSMou5Oa9sMrGg0SI1A-Q3gtRXJ4JG3xG6lNGhegozwP0_59I4MzbrXuh8bjqBrQ6qEciuVAcxDQC31AQ-L2b3sy2dpo8TnsfkEK9hAU1oibisIXA0_Qede46yk7KkrR_Q	2026-05-28 17:27:21.536588+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-28 17:27:21.109609+00	2026-04-28 17:27:21.109609+00
d345b27f-5c2f-4fea-b949-b0f1e49c460e	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzM5ODIwNH0.IJn7GRkk51l2oY0xAjBFcfZPr7JpjcQ3VEnctVczw0yHGe77zbJi9NDJa2aQcjHvMfmfZntUPs0_DcgolbopsxVJndLI4Bd4xRg3uZ94k6Cfuy-wKxj_EJ3Se3ZQhEeLhTS3qau7gEKQw6OlhCUjFAkDtXNb0r658iwpFlURLII2E_QXnobRtFNy9seNV7LQnRJzeb-DY9hUSRUA3m09UshoUcWRJANZ6htXEKCSTB-3_SOjdAOE1f_zwv-DhSemxe6Wsbh8A4aio6LIeE55aWHRJC4-VXL0knBJBOGlCq8gZGIg1JTyFYXozzvzmMi1chva8kXJCCq89EACT1Ok3g	2026-05-28 17:28:24.152976+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-28 17:28:23.842114+00	2026-04-28 17:28:23.842114+00
2970fd02-ca30-4dee-b5da-2c91e63f4f72	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzM5ODMwMH0.NImLPVbLAWDSeG1qhblMHlJGLJtXFYTJ-rJ0oPqo-iC7lKfprFQWzyEYljIFKeWJizBRNyKalvAztiIfkUR5yxadvcKtpr7dQ1oNu5XLw74BHY9Oeg0M_pqvgGdEYqMmmXnZrohzhFGYeZ9jCoCOG_A9yCnw_TNd627lWCTjVAnKknnqNK4nzvNjBns_HmlwecCeYf7Qq-e7OOjZXcGqrAD2pB4z_OPJOaUzDbuylXlBGcnDz0yoxMz60mn1VwJPqiZHFChLSwRurd11nT1KexXpyBVi7RxeGK_tVzu07dkB0IZOvtf6shsbrj-gekx9kmUFxyFje-pkJDbh4PkkTQ	2026-05-28 17:30:00.308313+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-28 17:29:59.959772+00	2026-04-28 17:29:59.959772+00
ae4c6cd5-6b72-4510-9297-5529dbacfb39	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzQyNjYyNn0.Zs4QQU9urU85K-zcqzJU2xPGbE5XwQYrb4Q-oz3wpWz9qNLis3KnzDaOe_ng2AlB_6u1U8IbXfYDUYS6f3hETtYD3pGsqjmBqPgYcTDT0mNKrHVfRIu3PkMuDxgaY-WTlMNiaWtifpP5xDn7JEOqb8gHvAlxyA4wioaFBai1GUOGzcOvNIjurbHSvLcuAbTaSaelVu4EBU9I47-ZAmuoNk5NhvOEwaLVo1WE5j-HJzD8jKNMTiYeacPYYZzgc1OtfDC7IzTJm7hR7tPFdM9B_DX1KYlnKI2v3i-r_k_QLHjg_aGj-52asVDZNWwZpPpbZmz3OI8PEFdpd5Nzilo3TQ	2026-05-29 01:22:06.524035+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-29 01:22:06.168026+00	2026-04-29 01:22:06.168026+00
a4672cd1-1d5a-441d-96b6-030ecf61c15b	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzQzMDg1MX0.Ay6HP-kZJSz-RcPO5vVsQ1DTTi8CLo3327vB7n4XBeDJR8GtN_bFzQKlZItR8ImIGoFx3QPagNhx85y12KXQ9OMPzKwnmiXhdXb0HB-BPwR4QZM0NP3jlZAaFj6A9B83CVqeMdoWL00sDEsJakx8oDQqT8U-rSjkc4XIXm7smjZp0JivA7GISbqQggFGPtL3Mbu5ndvei1VFFSP_t33HkzLnuKqwbSuD74VDhU7-3Zlw8HaDXXQp0vxaN0LE0UGXKjARXCD9Eci1xT-M5ryLKQyT5JhAXRLgE7Bdoez7zLG5OclEMIYnxwvTr77-JVoigTOoVpnT6XYRdbSpwPLoAA	2026-05-29 02:32:31.267896+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-29 02:32:30.906783+00	2026-04-29 02:32:30.906783+00
\.


--
-- TOC entry 4140 (class 0 OID 16707)
-- Dependencies: 218
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 4392 (class 0 OID 17527)
-- Dependencies: 226
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, user_id, team_id, created_at) FROM stdin;
25cc5c14-08a7-4459-984a-0e6cd9aa1b1c	7e564bea-a947-4479-9419-bf09f4e78e0e	57480b2e-de08-4649-964f-dad86e9c9776	2026-04-28 09:17:20.148473+00
b3825f05-74c6-4fba-8389-99945e64d51b	bab3cfad-0ba5-41da-afa1-e48807528483	78f7d87c-fc80-4655-8ca6-580126d26d01	2026-04-29 05:15:24.341777+00
d75b92b7-bdb7-45d9-aa84-0890c57c0d8e	e00cf2f3-50e1-41f2-8441-1b3adc47b26d	2b00987d-a573-4dd9-b99e-554d8ba3c317	2026-04-29 05:15:24.341777+00
6f3a711c-bac1-47c5-bf81-2212faf23939	dcc84f31-1bcb-4bac-a8eb-bcaefdcd0bb7	a98fdc6e-0a88-43a3-9b9a-3c3ddfb44b79	2026-04-29 05:15:24.341777+00
82dac6c3-36ac-4318-8b08-75545e6f9526	f5851baf-a578-4844-aa80-65fe715e3332	7520442c-2ade-4a61-a1aa-41dca30c8a37	2026-04-29 05:15:24.341777+00
ec4366b6-5c48-4bc4-b112-624b74131f0a	6c86f988-8491-4295-a8ed-69b105f890c2	78f7d87c-fc80-4655-8ca6-580126d26d01	2026-04-29 05:15:24.341777+00
0beb6d12-2774-4170-940b-bc8182e7e620	0761f770-15f2-4b7f-9b84-311316aad0c2	78f7d87c-fc80-4655-8ca6-580126d26d01	2026-04-29 05:15:24.341777+00
8ed39c9d-c24d-45af-bf62-e3e47de6f584	5ee081a0-7ae2-463d-9cd4-96718b05f2e7	a98fdc6e-0a88-43a3-9b9a-3c3ddfb44b79	2026-04-29 05:15:24.341777+00
c0feb06c-fa7c-4f97-8719-e0616eeaecfb	77a49617-dcc0-456c-9fd7-df35779f19fc	2b00987d-a573-4dd9-b99e-554d8ba3c317	2026-04-29 05:15:24.341777+00
21215bc3-a886-4e01-9e0f-236006244293	12aa528e-2b60-4d5a-9e78-85c2f14e8262	2b00987d-a573-4dd9-b99e-554d8ba3c317	2026-04-29 05:15:24.341777+00
c56f9a6c-5e57-42ea-b1c0-b387722d49c7	9bb23fd8-a35c-4eab-afd6-7a97c91d5f7d	2b00987d-a573-4dd9-b99e-554d8ba3c317	2026-04-29 05:15:24.341777+00
\.


--
-- TOC entry 4391 (class 0 OID 17511)
-- Dependencies: 225
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, owner_id, name, description, join_code, created_at, updated_at) FROM stdin;
57480b2e-de08-4649-964f-dad86e9c9776	7e564bea-a947-4479-9419-bf09f4e78e0e	string	string	R7TJRlbe	2026-04-28 09:17:20.148473+00	2026-04-28 09:17:20.148473+00
78f7d87c-fc80-4655-8ca6-580126d26d01	bab3cfad-0ba5-41da-afa1-e48807528483	Demo Team 1	Демо команда #1	6499c849	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00
2b00987d-a573-4dd9-b99e-554d8ba3c317	e00cf2f3-50e1-41f2-8441-1b3adc47b26d	Demo Team 2	Демо команда #2	a7ac8494	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00
a98fdc6e-0a88-43a3-9b9a-3c3ddfb44b79	dcc84f31-1bcb-4bac-a8eb-bcaefdcd0bb7	Demo Team 3	Демо команда #3	d3605207	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00
7520442c-2ade-4a61-a1aa-41dca30c8a37	f5851baf-a578-4844-aa80-65fe715e3332	Demo Team 4	Демо команда #4	656bb915	2026-04-29 05:15:24.341777+00	2026-04-29 05:15:24.341777+00
\.


--
-- TOC entry 4389 (class 0 OID 17481)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, hashed_password, age_group_id, role, is_deleted, created_at, nickname) FROM stdin;
7e564bea-a947-4479-9419-bf09f4e78e0e	string	$2b$12$sG8cvt8Oj0jYYDOdiWLUS.UejVInUQXllkIhgMZQ0BrL3iuNh8P5e	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-27 17:56:03.24542+00	string
bab3cfad-0ba5-41da-afa1-e48807528483	demo_user_01	$2b$12$iMMkgyc6f87T1flhh5/dJOQ2EgHDrmq2ZX/9peFRWy./IzgqB9iq.	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок01
e00cf2f3-50e1-41f2-8441-1b3adc47b26d	demo_user_02	$2b$12$oYphmL2mTVNze5r69K9YF.eWkUntNlVLfdyhEg0aAGgg6/HU5DUpe	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок02
dcc84f31-1bcb-4bac-a8eb-bcaefdcd0bb7	demo_user_03	$2b$12$tMnxVuQRWkA/E3pvnzeEB.mTDzznpQsllngMQnT1O8NeQ/HWykim6	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок03
f5851baf-a578-4844-aa80-65fe715e3332	demo_user_04	$2b$12$JIs4S4kFT7BO.RCQx1qLreGaJewcRZpuTVHDn86FzMjS5jUmAcOze	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок04
6c86f988-8491-4295-a8ed-69b105f890c2	demo_user_05	$2b$12$1UzE1bt4GSZk/cP2HxtmO.gbihuncbcpPWoG74Ay7oKbPsFy.Pl22	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок05
0761f770-15f2-4b7f-9b84-311316aad0c2	demo_user_06	$2b$12$ClLFDPudHLT8h/uXqNvMxuIHO94aKaGzWYqws4AGWeB0.PEu9DnIG	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок06
5ee081a0-7ae2-463d-9cd4-96718b05f2e7	demo_user_07	$2b$12$.m9sQolhP/Jv4J4C8Kn9qOwC9y5ttPp04xqGRsVPxNOq7utNIEjnG	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок07
77a49617-dcc0-456c-9fd7-df35779f19fc	demo_user_08	$2b$12$m/l7XuxUOVG4q4voxRAEKOY2obLrvRcPme0loFvTPCvvV238uTnWe	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок08
12aa528e-2b60-4d5a-9e78-85c2f14e8262	demo_user_09	$2b$12$psRs1WVHCFpJgo1qMp92UuCszcml23sF0ASDEucyz3EFB19o1W/dK	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок09
9bb23fd8-a35c-4eab-afd6-7a97c91d5f7d	demo_user_10	$2b$12$qO0Ho6GHLExzp3CmXeFyLeWvJip5xv1GA0OdNZwzCVD0KtTyGo3AK	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-29 05:15:24.341777+00	ДемоИгрок10
f23b7983-3d17-4dfc-af5f-66b91d23b501	demo_moderator	$2b$12$5JW6rQ.akuSdnoKefc5AYu3HxWk4YTPWrGsNZZAhlHC2lXv.QQdx2	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	MODERATOR	f	2026-04-29 05:15:24.341777+00	DemoModerator
\.


--
-- TOC entry 4413 (class 0 OID 0)
-- Dependencies: 231
-- Name: checkpoint_answers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checkpoint_answers_id_seq', 160, true);


--
-- TOC entry 4414 (class 0 OID 0)
-- Dependencies: 233
-- Name: checkpoint_hints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checkpoint_hints_id_seq', 192, true);


--
-- TOC entry 4415 (class 0 OID 0)
-- Dependencies: 229
-- Name: checkpoints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.checkpoints_id_seq', 64, true);


--
-- TOC entry 4416 (class 0 OID 0)
-- Dependencies: 236
-- Name: quest_session_checkpoint_attempts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.quest_session_checkpoint_attempts_id_seq', 77, true);


-- Completed on 2026-04-29 09:21:29

--
-- PostgreSQL database dump complete
--

\unrestrict ADPmUNLKsTeiBck0D9IzFhZbdOs5qTQImVPDhFVK0W4gt9E9bMKV7OiAhSShOY1

