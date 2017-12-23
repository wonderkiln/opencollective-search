import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import { graphql } from 'react-apollo';
import query from 'src/graphql/queries/all_collectives.gql';
import { take, filter, includes } from 'lodash';

import css from './main.scss';
import logo from '../../images/oc-logo-name.svg';
import loadingImage from '../../images/loading.gif';
import defaultAvatar from '../../images/default_avatar.svg';

@graphql(query)
export default class Main extends React.PureComponent {
  static propTypes = {
    data: PropTypes.shape({
      allCollectives: PropTypes.array,
      loading: PropTypes.bool,
    }),
  }
  static defaultProps = {
    data: {
      allCollectives: [],
      loading: false,
    },
  }

  constructor(props) {
    super(props);
    this.state = {
      results: [],
    };
  }

  getImageForItem(item) {
    if (!item.image) return defaultAvatar;
    if (!item.image.startsWith('http')) return defaultAvatar;
    return item.image;
  }

  getLinkForItem(item) {
    if (!item.slug) return null;
    return `https://opencollective.com/${item.slug}`;
  }

  search(event) {
    const text = event.target.value.toLowerCase();
    if (!text || /^\s*$/.test(text)) {
      this.setState({ results: [] });
      return;
    }
    const { allCollectives = [] } = this.props.data;
    const results = take(filter(allCollectives, el => {
      if (!el.isActive) return false;
      if (!el.name && !el.description) return false;
      return includes(`${el.name}${el.description}`.toLowerCase(), text);
    }), 5);
    this.setState({ results });
  }

  render() {
    const { allCollectives = [], loading } = this.props.data;
    return (
      <div className={css.container}>
        <Helmet>
          <title>OpenCollective Search</title>
          <meta name="description" content="OpenCollective Search" />
        </Helmet>
        <div className={css.centerContainer}>
          <img src={logo} alt="OpenCollective" className={css.logo} />
          <div className={css.motto}>
            A NEW FORM OF ASSOCIATION, TRANSPARENT BY DESIGN
          </div>
          <div className={css.searchContainer}>
            <input
              placeholder={loading ?
                'Loading projects for you...' :
                `Search through ${allCollectives.length} projects...`
              }
              onChange={event => this.search(event)}
              className={css.search}
              type="search" />
            {loading && <img src={loadingImage} alt="Loading" className={css.searchIndicator} />}
          </div>
          {this.state.results &&
            <div className={css.results}>
              {this.state.results.map(item => (
                <a key={item.id} className={css.resultItem} href={this.getLinkForItem(item)} target="_blank">
                  <div className={css.resultImageContainer}>
                    <img
                      src={this.getImageForItem(item)}
                      className={css.resultImage}
                      alt={item.name} />
                  </div>
                  <div className={css.resultContainer}>
                    <span className={css.resultTitle}>{item.name}</span>
                    <span className={css.resultDescription}>{item.description}</span>
                  </div>
                </a>
              ))}
            </div>
          }
        </div>
        <div className={css.footer}>
          Copyright © <a href="https://opencollective.com" target="_blank" rel="noopener noreferrer">OpenCollective</a> 2017
        </div>
      </div>
    );
  }
}
