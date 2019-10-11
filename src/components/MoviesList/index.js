import React, { Component } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import api, { servicesAPIs } from '../../services/api';

import './index.scss';

class MoviesList extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      movies: []
    };

    this.componentDidMount = this.componentDidMount.bind(this);
    this.getData = this.getData.bind(this);
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    const {
      homeSectionMovies,
      homeSectionMoviesFilter,
      homeConfig
    } = servicesAPIs;

    const criteriaFilter = {
      Criteria: {
        MediaType: homeSectionMoviesFilter.Criteria.MediaType,
        SectionId: this.props.section.Id
      }
    };

    const response = await api.post(
      homeSectionMovies,
      { ...homeSectionMoviesFilter, ...criteriaFilter },
      homeConfig
    );

    const movies = response.data.FindMediaResult.Movies.map(item => ({
      id: item.Id,
      title: item.FullTitle,
      image: item.Images.find(image => image.TypeId == 5001),
      imdbId: item.ImdbId,
      url: item.Metadata.UniqueUrl,
      price: item.RentPrice
    }));

    this.setState({ loading: false, movies });
  }

  render() {
    const { Id: id, Name: name, Url: url } = this.props.section;
    const { loading, movies } = this.state;

    return (
      <>
        <section className="movies-list inner">
          <header>
            <h2 data-section-id={id}>{name}</h2>
          </header>
          <SkeletonTheme
            className="skeleton"
            color="#ff7748"
            highlightColor="#f45728"
          >
            <div className="movies-slider">
              {!loading
                ? movies.map((item, index) => (
                    <div key={index} className="item">
                      <Link
                        to={{
                          pathname: `/detalhes/${item.id}/${item.url}`,
                          state: {
                            modal: true
                          }
                        }}
                      >
                        <div className="image-wrapper">
                          <img src={item.image.Url} alt={item.title} />
                        </div>
                      </Link>
                    </div>
                  ))
                : [1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
                    <div key={index} className="item">
                      <div className="image-wrapper">
                        <Skeleton height={200} width={300} />
                      </div>
                    </div>
                  ))}
            </div>
          </SkeletonTheme>
        </section>
      </>
    );
  }
}

export default MoviesList;
