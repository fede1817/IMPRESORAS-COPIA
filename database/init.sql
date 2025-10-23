--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5
-- Dumped by pg_dump version 17.5

-- Started on 2025-10-23 08:25:26

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
-- TOC entry 217 (class 1259 OID 16487)
-- Name: impresoras; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.impresoras (
    id integer NOT NULL,
    ip character varying(50) NOT NULL,
    sucursal character varying(100),
    modelo character varying(100),
    drivers_url text,
    tipo character varying(50),
    fecha_ultimo_cambio timestamp without time zone,
    cambios_toner integer DEFAULT 0,
    toner_reserva integer DEFAULT 0,
    toner_anterior integer DEFAULT 0,
    numero_serie text,
    contador_paginas integer,
    direccion text,
    telefono text,
    correo text,
    ultimo_pedido_contador integer,
    ultimo_pedido_fecha timestamp without time zone,
    ultima_alerta timestamp without time zone
);


ALTER TABLE public.impresoras OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16495)
-- Name: impresoras_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.impresoras_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.impresoras_id_seq OWNER TO postgres;

--
-- TOC entry 4817 (class 0 OID 0)
-- Dependencies: 218
-- Name: impresoras_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.impresoras_id_seq OWNED BY public.impresoras.id;


--
-- TOC entry 219 (class 1259 OID 16496)
-- Name: servidores; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.servidores (
    id integer NOT NULL,
    ip character varying(15) NOT NULL,
    sucursal character varying(100) NOT NULL,
    nombre character varying(100),
    tipo character varying(50) DEFAULT 'servidor'::character varying,
    estado character varying(20) DEFAULT 'inactivo'::character varying,
    latencia character varying(20) DEFAULT '0ms'::character varying,
    ultima_verificacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.servidores OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16505)
-- Name: servidores_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.servidores_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.servidores_id_seq OWNER TO postgres;

--
-- TOC entry 4818 (class 0 OID 0)
-- Dependencies: 220
-- Name: servidores_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.servidores_id_seq OWNED BY public.servidores.id;


--
-- TOC entry 4646 (class 2604 OID 16506)
-- Name: impresoras id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impresoras ALTER COLUMN id SET DEFAULT nextval('public.impresoras_id_seq'::regclass);


--
-- TOC entry 4650 (class 2604 OID 16507)
-- Name: servidores id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servidores ALTER COLUMN id SET DEFAULT nextval('public.servidores_id_seq'::regclass);


--
-- TOC entry 4808 (class 0 OID 16487)
-- Dependencies: 217
-- Data for Name: impresoras; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.impresoras (id, ip, sucursal, modelo, drivers_url, tipo, fecha_ultimo_cambio, cambios_toner, toner_reserva, toner_anterior, numero_serie, contador_paginas, direccion, telefono, correo, ultimo_pedido_contador, ultimo_pedido_fecha, ultima_alerta) FROM stdin;
15	192.168.2.22	Encarnacion	P 501/502	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343272/V3100/z03653L16.exe	backup	\N	0	0	0	\N	\N	Direcci¢n no especificada	\N	\N	\N	\N	\N
13	192.168.4.22	Caaguazu	P 501/502	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343272/V3100/z03653L16.exe	backup	2025-09-19 18:01:20.208966	3	0	100	5382P380086	24493	Direcci¢n no especificada	\N	\N	\N	2025-07-18 13:59:14.07954	2025-09-09 16:15:35.03084
10	192.168.48.121	Concepcion	RICOH P 800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	principal	2025-09-22 14:37:32.269055	5	4	50	5304X375774	205138	Mcal. Francisco Lopez, Gral Bernardino Caballero	\N	\N	\N	2025-07-18 11:34:51.200761	2025-09-19 18:01:17.096483
6	192.168.8.23	Asuncion	IM 430	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343273/V3100/z03655L16.exe	comercial	2025-09-30 14:30:16.688765	3	0	90	3354P450006	53906	Direcci¢n no especificada	\N	\N	\N	2025-07-18 11:32:36.093232	2025-09-26 18:04:56.492059
5	192.168.2.21	Encarnacion	SP 8400DN	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343271/V3100/z03651L16.exe	principal	2025-09-09 16:15:35.062013	2	3	60	Y871RA10103	379119	RUTA 1 KM 6 1.5 CERCA DE LA ENTRADA BARRIO ITA P - ENCARNACION	\N	\N	\N	2025-07-18 11:34:40.323487	2025-08-28 15:55:30.769478
17	192.168.48.122	Concepcion	RICOH P 800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	backup	2025-09-09 16:15:33.623444	3	0	70	5304X375768	29839	Direcci¢n no especificada	\N	\N	\N	\N	\N
99	192.168.2.157	Encarnacion	HP LaserJet P2055dn	https://support.hp.com/py-es/drivers/hp-laserjet-2055-printer-series/model/3662058	comercial	\N	0	0	-2	CNC1C18050	140117	Direcci	\N	\N	\N	\N	\N
16	192.168.46.22	Misiones	RICOH P 800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	backup	2025-10-03 07:05:28.03573	1	1	80	5302XA59278	6631	4WCV+79W, San Ignacio 080316	\N	\N	\N	2025-10-10 14:12:14.914572	2025-10-02 07:55:27.801713
65	192.168.5.8	PJC	HP MFP M127fn	https://www.google.com/	comercial	\N	0	1	0	\N	\N	Direcci¢n no especificada	\N	\N	\N	\N	\N
7	192.168.8.20	Asuncion-color	P C600	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343154/V3200/z04340L16.exe	comercial	2025-09-09 16:15:35.071515	2	0	70	5321X720063	26831	Direcci¢n no especificada	\N	\N	\N	2025-07-18 11:32:36.087769	\N
8	192.168.8.41	Asuncion-RRHH	P 501/502	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343272/V3100/z03653L16.exe	comercial	2025-09-22 14:37:36.487585	3	0	100	5380PC01014	88144	Direcci¢n no especificada	\N	\N	\N	2025-07-18 11:32:36.071002	2025-09-19 18:01:21.790712
11	192.168.7.22	Santani	P 501/502	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343272/V3100/z03653L16.exe	backup	2025-09-09 16:15:33.074234	3	2	90	5382P380185	38144	RUTA ACCESO A SANTANI - 200 METROS DE LA ROTONDA	\N	\N	\N	2025-07-24 08:48:02.566268	\N
66	192.168.48.8	Concepcion	HP M201dw	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	comercial	2025-09-25 07:52:18.931053	4	0	67	BRBSH2JD55	106913	Mcal. Francisco Lopez, Gral Bernardino Caballero	\N	\N	\N	2025-07-23 16:12:23.411302	\N
98	192.168.3.21	Ciudad del Este	RICOH P 800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	principal	2025-10-17 16:20:25.825353	1	1	100	5302X453123	400694	Los Rosales esquina Padre Guillermo Bauman - CIUDAD DEL ESTE	\N	\N	\N	2025-10-10 14:12:01.556277	2025-10-17 09:55:30.008341
14	192.168.3.22	Ciudad del Este	RICOH P 800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	backup	2025-09-09 16:15:33.68212	1	0	-2	5302X453119	93518	Direcci¢n no especificada	\N	\N	\N	\N	\N
9	192.168.46.21	Misiones	RICOH P 800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	principal	2025-10-01 09:55:17.217162	4	0	100	5302XA59354	209206	4WCV+79W, San Ignacio 080316	\N	\N	\N	2025-09-30 14:34:41.038859	2025-08-06 15:35:52.883965
12	192.168.5.22	Pedro Juan Caballero	P 501/502	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343272/V3100/z03653L16.exe	backup	2025-09-09 16:15:35.046178	2	0	70	5382P380089	26697	Direcci¢n no especificada	\N	\N	\N	\N	\N
31	192.168.7.21	Santani 	RICOHP P800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	principal	2025-10-10 17:22:39.497404	3	2	90	5301XC46541	308927	 RUTA ACCESO A SANTANI - 200 METROS DE LA ROTONDA	\N	\N	\N	2025-10-13 09:59:04.570701	2025-10-10 08:32:42.792773
64	192.168.4.21	Caaguazu	RICOH P 800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	principal	2025-10-02 15:15:16.298072	5	2	60	5301XC46584	524956	RUTA 7 GASPAR R DE FRANCIA KM 180 - CAAGUAZU	\N	\N	\N	2025-10-01 09:46:39.450418	2025-09-26 16:29:55.249762
96	192.168.8.24	Caaguazu	HP LaserJet M203dw	https://support.hp.com/bo-es/drivers/hp-laserjet-pro-m203-printer-series/9365762	comercial	2025-10-21 15:41:51.748318	3	2	99	BRBSKCDK34	63976	Direcci¢n no especificada	\N	\N	\N	2025-07-24 10:09:04.771561	2025-09-09 16:15:35.464975
63	192.168.5.21	PJC	RICOH P 800	https://support.ricoh.com/bb/pub_e/dr_ut_e/0001343/0001343146/V3200/z04344L17.exe	principal	2025-10-02 18:45:14.69549	4	1	60	5301XC46579	347538	Direcci¢n no especificada	\N	\N	\N	2025-10-01 09:46:50.001004	2025-10-01 08:40:20.623771
\.


--
-- TOC entry 4810 (class 0 OID 16496)
-- Dependencies: 219
-- Data for Name: servidores; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.servidores (id, ip, sucursal, nombre, tipo, estado, latencia, ultima_verificacion, created_at, updated_at) FROM stdin;
9	192.168.7.1	SANTANI	PRUEBA	SERVIDOR	activo	15ms	2025-10-22 06:26:31.936134	2025-09-25 15:22:09.650318	2025-09-25 15:22:09.650318
13	192.168.46.1	MISIONES	MISIONES	Router	activo	5ms	2025-10-22 06:26:32.034555	2025-09-30 17:25:04.688695	2025-09-30 17:25:04.688695
14	192.168.48.1	CONCEPCION	CONCEPCION	Router	activo	9ms	2025-10-22 06:26:32.131625	2025-09-30 17:26:27.149373	2025-09-30 17:26:27.149373
7	192.168.4.1	CAAGUAZU	PRUEBA	SERVIDOR	activo	9ms	2025-10-22 06:26:32.230238	2025-09-25 15:20:10.229709	2025-09-25 15:20:10.229709
4	192.168.8.1	ASUNCION	HOLA	servidor	activo	1ms	2025-10-22 06:26:32.320002	2025-09-25 15:04:40.509524	2025-09-25 15:04:40.509524
6	192.168.2.1	ENCARNACION	PREUBA	SERVIDOR	activo	8ms	2025-10-22 06:26:32.418895	2025-09-25 15:19:00.073	2025-09-25 15:19:00.073
5	192.168.3.1	CDE	PRUEBA	SERVIDOR	activo	6ms	2025-10-22 06:26:32.51799	2025-09-25 15:17:52.43676	2025-09-25 15:17:52.43676
8	192.168.5.1	PJC	PRUEBA	SERVIDOR	activo	10ms	2025-10-22 06:26:32.623339	2025-09-25 15:21:08.199201	2025-09-25 15:21:08.199201
\.


--
-- TOC entry 4819 (class 0 OID 0)
-- Dependencies: 218
-- Name: impresoras_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.impresoras_id_seq', 99, true);


--
-- TOC entry 4820 (class 0 OID 0)
-- Dependencies: 220
-- Name: servidores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.servidores_id_seq', 14, true);


--
-- TOC entry 4658 (class 2606 OID 16509)
-- Name: impresoras impresoras_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.impresoras
    ADD CONSTRAINT impresoras_pkey PRIMARY KEY (id);


--
-- TOC entry 4660 (class 2606 OID 16511)
-- Name: servidores servidores_ip_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servidores
    ADD CONSTRAINT servidores_ip_key UNIQUE (ip);


--
-- TOC entry 4662 (class 2606 OID 16513)
-- Name: servidores servidores_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.servidores
    ADD CONSTRAINT servidores_pkey PRIMARY KEY (id);


-- Completed on 2025-10-23 08:25:27

--
-- PostgreSQL database dump complete
--

