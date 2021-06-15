import React from "react";
import {
  Text,
  View,
  ScrollView,
  FlatList,
  Modal,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert, 
  PanResponder
} from "react-native";
import { Card, Icon, Rating, Input } from "react-native-elements";
import { connect } from "react-redux";
import { baseUrl } from "../shared/baseUrl";
import { postFavorite, postComment } from "../redux/ActionCreators";
import * as Animatable from "react-native-animatable";

const mapStateToProps = (state) => {
  return {
    dishes: state.dishes,
    comments: state.comments,
    favorites: state.favorites,
  };
};

const mapDispatchToProps = (dispatch) => ({
  postFavorite: (dishId) => dispatch(postFavorite(dishId)),
  postComment: (dishId, rating, author, comment) =>
    dispatch(postComment(dishId, rating, author, comment)),
});

function RenderDish(props) {
  const dish = props.dish;

  handleViewRef = ref => this.view = ref;

  const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
    if ( dx < -200 )
        return true;
    else
        return false;
}

const panResponder = PanResponder.create({
  onStartShouldSetPanResponder: (e, gestureState) => {
      return true;
  },
  onPanResponderGrant: () => {
    this.view.rubberBand(1000)
    .then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
  },
  onPanResponderEnd: (e, gestureState) => {
      console.log("pan responder end", gestureState);
      if (recognizeDrag(gestureState))
          Alert.alert(
              'Add Favorite',
              'Are you sure you wish to add ' + dish.name + ' to favorite?',
              [
              {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
              {text: 'OK', onPress: () => {props.favorite ? console.log('Already favorite') : props.onPress()}},
              ],
              { cancelable: false }
          );

      return true;
  }
})



  if (dish != null) {
    return (
      <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
      ref={this.handleViewRef}
      {...panResponder.panHandlers}>
        <Card featuredTitle={dish.name} image={{ uri: baseUrl + dish.image }}>
          <Text style={{ margin: 10 }}>{dish.description}</Text>
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              flexDirection: "row",
            }}
          >
            <Icon
              raised
              reverse
              name={props.favorite ? "heart" : "heart-o"}
              type="font-awesome"
              color="#f50"
              onPress={() =>
                props.favorite
                  ? console.log("already favorite")
                  : props.onPress()
              }
            />
            <Icon
              raised
              reverse
              name="pencil"
              type="font-awesome"
              color="#512DA8"
              onPress={(dishId) => props.toggleModal(dishId)}
            />
          </View>
        </Card>
      </Animatable.View>
    );
  } else {
    return <View></View>;
  }
}

function RenderComments(props) {
  const comments = props.comments;

  const renderCommentItem = ({ item, index }) => {
    return (
      <View key={index} style={{ margin: 10 }}>
        <Text style={{ fontSize: 14 }}>{item.comment}</Text>
        <Text style={{ fontSize: 12 }}>{item.rating} Stars</Text>
        <Text style={{ fontSize: 12 }}>
          {"-- " + item.author + ", " + item.date}{" "}
        </Text>
      </View>
    );
  };

  return (
    <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
      <Card title="Comments">
        <FlatList
          data={comments}
          renderItem={renderCommentItem}
          keyExtractor={(item) => (item.id ? item.id.toString() : "")}
        />
      </Card>
    </Animatable.View>
  );
}

class DishDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      comment: "",
      author: "",
      rating: 1,
      showModal: false,
    };
  }

  ratingCompleted = (rating) => this.setState({ rating });

  toggleModal() {
    this.setState({ showModal: !this.state.showModal });
  }

  handleComment = (dishId) => {
    alert(JSON.stringify(this.state));
    // alert(dishId)
    this.toggleModal();
    this.props.postComment(
      dishId,
      this.state.rating,
      this.state.author,
      this.state.comment
    );
  };

  resetForm = () => {
    this.setState({
      comment: "",
      author: "",
      rating: 1,
      showModal: false,
    });
    this.toggleModal();
  };

  markFavorite = (dishId) => this.props.postFavorite(dishId);

  static navigationOptions = {
    title: "Dish Details",
  };

  render() {
    const dishId = this.props.navigation.getParam("dishId", "");
    return (
      <ScrollView>
        <RenderDish
          dish={this.props.dishes.dishes[+dishId]}
          favorite={this.props.favorites.some((el) => el === dishId)}
          onPress={() => this.markFavorite(dishId)}
          toggleModal={() => this.toggleModal(dishId)}
        />
        <RenderComments
          comments={this.props.comments.comments.filter(
            (comment) => comment.dishId === dishId
          )}
        />
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.showModal}
          onDismiss={() => this.toggleModal()}
          onRequestClose={() => this.toggleModal()}
        >
          <View style={styles.modal}>
            <Rating
              ratingCount={5}
              imageSize={25}
              showRating
              startingValue="1"
              onFinishRating={this.ratingCompleted}
            />

            <Input
              placeholder="Author"
              leftIcon={{ type: "font-awesome", name: "user-o" }}
              style={styles.input}
              leftIconContainerStyle={{ marginLeft: 0, marginRight: 10 }}
              onChangeText={(value) => this.setState({ author: value })}
            />

            <Input
              placeholder="Comment"
              leftIcon={{ type: "font-awesome", name: "comment-o" }}
              leftIconContainerStyle={{ marginLeft: 0, marginRight: 10 }}
              onChangeText={(value) => this.setState({ comment: value })}
            />

            <TouchableOpacity style={{ marginBottom: 20, marginTop: 20 }}>
              <Button
                onPress={() => {
                  this.handleComment(dishId);
                }}
                color="#512DA8"
                title="Submit"
              />
            </TouchableOpacity>
            <Button
              onPress={() => {
                this.resetForm();
              }}
              color="#808080"
              title="Cancel"
            />
          </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  formRow: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    flexDirection: "row",
    margin: 20,
  },
  formLabel: {
    fontSize: 18,
    flex: 2,
  },
  formItem: {
    flex: 1,
  },
  modal: {
    justifyContent: "center",
    margin: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    backgroundColor: "#512DA8",
    textAlign: "center",
    color: "white",
    marginBottom: 20,
  },
  modalText: {
    fontSize: 18,
    margin: 10,
  },
  input: {
    justifyContent: "space-around",
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DishDetail);
