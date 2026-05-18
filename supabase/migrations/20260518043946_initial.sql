


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';


SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "category_id" bigint NOT NULL,
    "slug" "text" NOT NULL,
    "name" "text" NOT NULL,
    "color_from" "text" NOT NULL,
    "color_to" "text" NOT NULL
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."categories_category_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."categories_category_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."categories_category_id_seq" OWNED BY "public"."categories"."category_id";



CREATE TABLE IF NOT EXISTS "public"."comment" (
    "comment_id" integer NOT NULL,
    "content" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "parent_id" integer,
    "post_id" integer NOT NULL,
    "user_id" "uuid" NOT NULL
);


ALTER TABLE "public"."comment" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."comment_comment_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."comment_comment_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."comment_comment_id_seq" OWNED BY "public"."comment"."comment_id";



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" character varying(20) NOT NULL,
    "bio" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."comment_with_username" AS
 SELECT "c"."comment_id",
    "c"."content",
    "c"."created_at",
    "c"."updated_at",
    "c"."parent_id",
    "c"."post_id",
    "c"."user_id",
    "pr"."username"
   FROM ("public"."comment" "c"
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "c"."user_id")));


ALTER VIEW "public"."comment_with_username" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."post" (
    "post_id" integer NOT NULL,
    "title" character varying NOT NULL,
    "content" character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "category_id" bigint
);


ALTER TABLE "public"."post" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."post_post_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."post_post_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."post_post_id_seq" OWNED BY "public"."post"."post_id";



CREATE OR REPLACE VIEW "public"."post_with_username" WITH ("security_invoker"='on') AS
 SELECT "p"."post_id",
    "p"."title",
    "p"."content",
    "p"."created_at",
    "p"."updated_at",
    "p"."user_id",
    "p"."category_id",
    "pr"."username"
   FROM ("public"."post" "p"
     JOIN "public"."profiles" "pr" ON (("pr"."id" = "p"."user_id")));


ALTER VIEW "public"."post_with_username" OWNER TO "postgres";


ALTER TABLE ONLY "public"."categories" ALTER COLUMN "category_id" SET DEFAULT "nextval"('"public"."categories_category_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."comment" ALTER COLUMN "comment_id" SET DEFAULT "nextval"('"public"."comment_comment_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."post" ALTER COLUMN "post_id" SET DEFAULT "nextval"('"public"."post_post_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("category_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."comment"
    ADD CONSTRAINT "comment_pkey" PRIMARY KEY ("comment_id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_pkey" PRIMARY KEY ("post_id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."comment"
    ADD CONSTRAINT "comment_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comment"("comment_id");



ALTER TABLE ONLY "public"."comment"
    ADD CONSTRAINT "comment_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("post_id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("category_id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON UPDATE CASCADE ON DELETE CASCADE;



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON SEQUENCE "public"."categories_category_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."categories_category_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."categories_category_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."comment" TO "anon";
GRANT ALL ON TABLE "public"."comment" TO "authenticated";
GRANT ALL ON TABLE "public"."comment" TO "service_role";



GRANT ALL ON SEQUENCE "public"."comment_comment_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."comment_comment_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."comment_comment_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."comment_with_username" TO "anon";
GRANT ALL ON TABLE "public"."comment_with_username" TO "authenticated";
GRANT ALL ON TABLE "public"."comment_with_username" TO "service_role";



GRANT ALL ON TABLE "public"."post" TO "anon";
GRANT ALL ON TABLE "public"."post" TO "authenticated";
GRANT ALL ON TABLE "public"."post" TO "service_role";



GRANT ALL ON SEQUENCE "public"."post_post_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_post_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_post_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."post_with_username" TO "anon";
GRANT ALL ON TABLE "public"."post_with_username" TO "authenticated";
GRANT ALL ON TABLE "public"."post_with_username" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







