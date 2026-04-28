--
-- PostgreSQL database dump
--

\restrict Z3hdTQt4ffBZI1j5RLbKocKwY5ekdVdiE5JQXtgyoFy7Ge8mBa5IfU5YovSRPfu

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg110+2)
-- Dumped by pg_dump version 18.3

-- Started on 2026-04-28 14:00:45

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
\connect postgres

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
-- TOC entry 4318 (class 0 OID 17467)
-- Dependencies: 222
-- Data for Name: age_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.age_groups (id, name) FROM stdin;
5705a746-c2fc-4cbe-98d2-a9e5c076f89b	14-15
\.


--
-- TOC entry 4317 (class 0 OID 16384)
-- Dependencies: 216
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
d1f066ad0642
\.


--
-- TOC entry 4323 (class 0 OID 17559)
-- Dependencies: 227
-- Data for Name: quests; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quests (id, author_id, title, description, city_district, cover_file, difficulty, duration_minutes, rules_warning, status, rejection_reason, start_lat, start_lng, start_point, published_at, archived_at, created_at, updated_at) FROM stdin;
\.


--
-- TOC entry 4320 (class 0 OID 17496)
-- Dependencies: 224
-- Data for Name: refresh_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.refresh_session (refresh_token, access_token, expires_at, user_id, created_at, updated_at) FROM stdin;
5e52f21e-6388-4109-819e-9c8cad0ed974	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzM2ODcyNn0.IQLtUQ106ZVMdIu7vb-lQIMmlAI538OTkbVX7SURRVnRJ6e7r3r3Lpuqo8Lv1D_71mCCTTmXFj4vr3MaMLFXP8l6GtDaNdXrsMLESqCB7W0pxfrIRB8RhakDUxzGTguXPEXPddQZriNkMZWzuxgpce22PYWGw7PKOAozJ5jjlGUxfT1BR0Q_dyNfgzScH7z6XXHC0qKbG5FHjAXTvvXnz21M7iT4mOlPl-C-A2I0dwwYuYpA8EPQYRa9VE1FYEAooxCYFFG1pyl57QN0F1hzMmKnNyXtFWv01PSZDyNDG7G0k9IcLhybzS_8W9WCJFwo2CcC2J3g5QVwO0cwXLNZPA	2026-05-28 09:17:06.648496+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-28 09:17:06.285898+00	2026-04-28 09:17:06.285898+00
2a79a2a8-2d92-4065-babf-9145d0953050	eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3ZTU2NGJlYS1hOTQ3LTQ0NzktOTQxOS1iZjA5ZjRlNzhlMGUiLCJ1c2VybmFtZSI6InN0cmluZyIsInJvbGUiOiJVU0VSIiwiaXNfZGVsZXRlZCI6ZmFsc2UsImV4cCI6MTc3NzM2OTY4NH0.I9VmhGC8uTwHcZY-7QWbNV_VkqgTC_kMCUm4vek5Mmv_nUj0wVTP1Ig61v34d6EILyyAK3TUDzRIm-SulTv_Y8DOwdeUeY5ImqgmkHeJs-SqHl54P2r-Di4IiD9Wbq16PkXwjcPQ-FXq8xjCDZwSv7QT67ddRjKBYIRNRpV2iXhccn8d45kbAtPwTuRa_jpZpyqAgUQXEJJGkUKiBUeeYFi-pLwaQKxIUDJIOUx4xj0IAlsQA9XLmhhyTQ0H0zKOVxBONBR5fjrWGwLAEfSgouKnYueJPJ_V3ojCbN7jft84EgwJvMGjVEBh7DUhFOLjBmGK5wSC6LragR6w3P3a8Q	2026-05-28 09:33:04.24275+00	7e564bea-a947-4479-9419-bf09f4e78e0e	2026-04-28 09:33:03.901752+00	2026-04-28 09:33:03.901752+00
\.


--
-- TOC entry 4112 (class 0 OID 16707)
-- Dependencies: 218
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- TOC entry 4322 (class 0 OID 17527)
-- Dependencies: 226
-- Data for Name: team_members; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.team_members (id, user_id, team_id, created_at) FROM stdin;
25cc5c14-08a7-4459-984a-0e6cd9aa1b1c	7e564bea-a947-4479-9419-bf09f4e78e0e	57480b2e-de08-4649-964f-dad86e9c9776	2026-04-28 09:17:20.148473+00
\.


--
-- TOC entry 4321 (class 0 OID 17511)
-- Dependencies: 225
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.teams (id, owner_id, name, description, join_code, created_at, updated_at) FROM stdin;
57480b2e-de08-4649-964f-dad86e9c9776	7e564bea-a947-4479-9419-bf09f4e78e0e	string	string	R7TJRlbe	2026-04-28 09:17:20.148473+00	2026-04-28 09:17:20.148473+00
\.


--
-- TOC entry 4319 (class 0 OID 17481)
-- Dependencies: 223
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, hashed_password, age_group_id, role, is_deleted, created_at, nickname) FROM stdin;
7e564bea-a947-4479-9419-bf09f4e78e0e	string	$2b$12$sG8cvt8Oj0jYYDOdiWLUS.UejVInUQXllkIhgMZQ0BrL3iuNh8P5e	5705a746-c2fc-4cbe-98d2-a9e5c076f89b	USER	f	2026-04-27 17:56:03.24542+00	string
\.


-- Completed on 2026-04-28 14:00:45

--
-- PostgreSQL database dump complete
--

\unrestrict Z3hdTQt4ffBZI1j5RLbKocKwY5ekdVdiE5JQXtgyoFy7Ge8mBa5IfU5YovSRPfu

