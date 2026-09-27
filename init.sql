--
-- PostgreSQL database dump
--

\restrict QVlkUUKH3xmfpS4arjtCZ3fDSwcBup9EVWPb6okdgoQEiufe1fqtWRLKrTru0CR

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: basvurular; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.basvurular (
    id integer NOT NULL,
    vatandas_id integer NOT NULL,
    baslik character varying(200) NOT NULL,
    icerik text NOT NULL,
    durum character varying(20) DEFAULT 'beklemede'::character varying,
    olusturulma_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT basvurular_durum_check CHECK (((durum)::text = ANY ((ARRAY['beklemede'::character varying, 'inceleniyor'::character varying, 'onaylandi'::character varying, 'reddedildi'::character varying])::text[])))
);


ALTER TABLE public.basvurular OWNER TO postgres;

--
-- Name: basvurular_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.basvurular_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.basvurular_id_seq OWNER TO postgres;

--
-- Name: basvurular_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.basvurular_id_seq OWNED BY public.basvurular.id;


--
-- Name: islem_loglari; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.islem_loglari (
    id integer NOT NULL,
    basvuru_id integer NOT NULL,
    memur_id integer,
    islem_detayi text NOT NULL,
    islem_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.islem_loglari OWNER TO postgres;

--
-- Name: islem_loglari_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.islem_loglari_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.islem_loglari_id_seq OWNER TO postgres;

--
-- Name: islem_loglari_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.islem_loglari_id_seq OWNED BY public.islem_loglari.id;


--
-- Name: kullanicilar; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.kullanicilar (
    id integer NOT NULL,
    tckn character varying(11) NOT NULL,
    ad_soyad character varying(100) NOT NULL,
    sifre_hash text NOT NULL,
    rol character varying(20) DEFAULT 'vatandas'::character varying,
    kayit_tarihi timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT kullanicilar_rol_check CHECK (((rol)::text = ANY ((ARRAY['vatandas'::character varying, 'memur'::character varying, 'admin'::character varying])::text[])))
);


ALTER TABLE public.kullanicilar OWNER TO postgres;

--
-- Name: kullanicilar_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.kullanicilar_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.kullanicilar_id_seq OWNER TO postgres;

--
-- Name: kullanicilar_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.kullanicilar_id_seq OWNED BY public.kullanicilar.id;


--
-- Name: basvurular id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.basvurular ALTER COLUMN id SET DEFAULT nextval('public.basvurular_id_seq'::regclass);


--
-- Name: islem_loglari id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.islem_loglari ALTER COLUMN id SET DEFAULT nextval('public.islem_loglari_id_seq'::regclass);


--
-- Name: kullanicilar id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kullanicilar ALTER COLUMN id SET DEFAULT nextval('public.kullanicilar_id_seq'::regclass);


--
-- Name: basvurular basvurular_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.basvurular
    ADD CONSTRAINT basvurular_pkey PRIMARY KEY (id);


--
-- Name: islem_loglari islem_loglari_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.islem_loglari
    ADD CONSTRAINT islem_loglari_pkey PRIMARY KEY (id);


--
-- Name: kullanicilar kullanicilar_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kullanicilar
    ADD CONSTRAINT kullanicilar_pkey PRIMARY KEY (id);


--
-- Name: kullanicilar kullanicilar_tckn_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.kullanicilar
    ADD CONSTRAINT kullanicilar_tckn_key UNIQUE (tckn);


--
-- Name: basvurular basvurular_vatandas_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.basvurular
    ADD CONSTRAINT basvurular_vatandas_id_fkey FOREIGN KEY (vatandas_id) REFERENCES public.kullanicilar(id) ON DELETE CASCADE;


--
-- Name: islem_loglari islem_loglari_basvuru_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.islem_loglari
    ADD CONSTRAINT islem_loglari_basvuru_id_fkey FOREIGN KEY (basvuru_id) REFERENCES public.basvurular(id) ON DELETE CASCADE;


--
-- Name: islem_loglari islem_loglari_memur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.islem_loglari
    ADD CONSTRAINT islem_loglari_memur_id_fkey FOREIGN KEY (memur_id) REFERENCES public.kullanicilar(id) ON DELETE SET NULL;


--
-- PostgreSQL database dump complete
--

\unrestrict QVlkUUKH3xmfpS4arjtCZ3fDSwcBup9EVWPb6okdgoQEiufe1fqtWRLKrTru0CR

