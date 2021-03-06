// @flow strict
import React from 'react';
import { getContactHref } from '../../../utils';
import styles from './Author.module.scss';
import { useSiteMetadata } from '../../../hooks';

const Author = () => {
  const { author } = useSiteMetadata();

  return (
    <div className={styles['author']}>
      <p className={styles['author__bio']}>
        <span dangerouslySetInnerHTML={{ __html: author.bio }}></span>
        <a
          className={styles['author__bio-twitter']}
          href={getContactHref('linkedin', author.contacts.linkedin)}
          rel="noopener noreferrer"
          target="_blank"
        >
          <strong>{author.name}</strong> no LinkedIn
        </a>
      </p>
    </div>
  );
};

export default Author;
