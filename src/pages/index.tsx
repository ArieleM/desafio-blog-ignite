import { GetStaticProps } from 'next';
import Head from 'next/head';
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  console.log(postsPagination);

  return (
    <>
      <Head>
        <title>Posts | Bloginite</title>
      </Head>
      <main>
        <img src="/images/Logo.svg" alt="logo" />
        {postsPagination.results.map(post => {
          <a key={post.uid}>
            <strong>{post.data?.title}</strong>
            <p>{post.data?.subtitle}</p>
          </a>;
        })}
      </main>
    </>
  );
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'post')],
    {
      fetch: ['post.title', 'post.subtitle', 'post.author'],
      pageSize: 2,
    }
  );
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      title: RichText.asText(post.data.title),
      subtitle: post.data.subtitle,
      first_publication_date: format(new Date(), post.first_publication_date, {
        locale: ptBR,
      }),
      author: post.data.author,
    };
  });
  const postsPagination = {
    next_page: postsResponse.next_page,
    results: [...posts],
  };
  // console.log(postsPagination);

  return {
    props: {
      postsPagination,
    },
  };
};
