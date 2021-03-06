import React, { Component } from "react";
import { Link } from "react-router-dom";

import api, { servicesAPIs, defaultConfigAPIs } from "../../services/api";
import Shared from "../../configs/Shared";

import LoadingItems from "../../components/MoviesListLoading/Items";
import LazyImage from "../../components/LazyImage";

/** redux */
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { Creators as LoadingActions } from "../../store/ducks/loading";

import { insightsTrack } from "../../services/telemetry/telemetryService";

/** styles */
import "./index.scss";
import { Exception } from "@microsoft/applicationinsights-web";

class Search extends Component {
  constructor(props) {
    super(props);

    this.state = {
      notFound: false,
      loading: true,
      search: "",
      movies: []
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps == undefined) {
      return false;
    }

    if (this.state.search != this.props.match.params.search) {
      this.getData();
    }
  }

  componentDidMount() {
    this.getData();
  }

  async getData() {
    try {
      const { search } = this.props.match.params;

      insightsTrack.event("search", { searchTerm: search });

      if (search == "exception") {
        throw "Unexpected error by search";
      }

      if (search == "exceptionin") {
        // throw new Exception("Unexpected error by search");
        insightsTrack.exception(new Error("Exception without a throw..."));
      }

      if (search == "trace") {
        insightsTrack.trace("just a trace in the serach page");
      }

      if (search == null || search == "") {
        this.setState({
          loading: false,
          movies: [],
          notFound: true
        });

        return;
      } else this.setState({ search, loading: true });

      this.props.updateGlobalLoading(true);

      const searchRequestBody = {
        Criteria: {
          Name: search,
          OriginalName: search,
          MediaType: 10,
          DistributorId: 710,
          Actor: search,
          Director: search
        },
        ...servicesAPIs.searchSectionMoviesFilter
      };

      console.log(searchRequestBody);

      const response = await api.post(
        servicesAPIs.searchUrlApi,
        searchRequestBody,
        servicesAPIs.homeConfig
      );

      const movies = response.data.FindMediaResult.Movies.map(item => ({
        id: item.Id,
        title: item.FullTitle,
        image: item.Images.find(image => image.TypeId == 1010),
        imdbId: item.ImdbId,
        url: item.Metadata.UniqueUrl,
        price: item.RentPrice
      }));

      const notFound = movies.length == 0;
      const loading = false;

      this.setState({
        loading,
        movies,
        notFound
      });

      this.props.updateGlobalLoading(false);
    } catch (error) {
      insightsTrack.exception(error);
    }
  }

  render() {
    const { loading, movies, notFound } = this.state;
    const { search } = this.props.match.params;

    return (
      <>
        <div className="search-page-wrapper inner">
          <header>
            <h1>
              B<span className="lower">uscando por:</span> {search}
            </h1>
          </header>
          {loading ? (
            <LoadingItems />
          ) : (
            <div className="movies-list">
              {movies.map((item, index) => (
                <div key={index} className="item">
                  <center>
                    <Link
                      to={{
                        pathname: `/detalhes/${item.id}/${item.url}`,
                        state: {
                          modal: true
                        }
                      }}
                    >
                      <div className="image-wrapper">
                        <LazyImage src={item.image.Url} alt={item.title} />
                      </div>
                    </Link>
                  </center>
                </div>
              ))}
            </div>
          )}

          {notFound && (
            <p>Não foram encontrados títulos que correspondem a pesquisa</p>
          )}
        </div>
      </>
    );
  }
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(LoadingActions, dispatch);

const SearchMapped = connect(
  null,
  mapDispatchToProps
)(Search);

export default SearchMapped;
