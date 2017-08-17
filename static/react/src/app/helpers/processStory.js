//function to get first card details of provided node slug
export function getFirstCard(output, node_slug) {
  var node = fetchNodeFromTree(node_slug, output);
  console.log("getFirstCard is called!! for node");
  console.log(node);
  if (node.listOfCards.length > 0) {
    return node.listOfCards[0];
  } else {
    if (node.listOfNodes[0].listOfCards.length > 0) {
      return node.listOfNodes[0].listOfCards[0];
    }
  }
}

//function to fetch card details for corresponding card slug form provided node object
function fetchCardFromNode(card_slug, node) {
  console.log("fetchCardFromNode is called :" + card_slug);
  console.log(node);
  var listOfCards = node.listOfCards;
  for (var i = 0; i < listOfCards.length; i++) {
    if (listOfCards[i].slug === card_slug) {
      return listOfCards[i];
    }
  }
}

//function to fetch the node object from full json response
export function fetchNodeFromTree(node_slug, output) {
  console.log("fetchNodeFromTree is called for: " + node_slug);
  console.log(output);
  var element = output;
  var result = searchTree(element, node_slug);
  return result;
}

//to search node in recursive manner
function searchTree(element, matchingNode) {
  console.log("searchTree is called:" + matchingNode);
  console.log(element);
  if (element.slug == matchingNode) {
    return element;
  } else if (element.listOfNodes != null) {
    var i;
    var result = null;
    for (i = 0; result == null && i < element.listOfNodes.length; i++) {
      result = searchTree(element.listOfNodes[i], matchingNode);
    }
    return result;
  }
  return null;
}

//fetch card based on params levels in url from json response
export function fetchCard(params, output) {
  //fetch specific card..
  console.log("fetchCard is called");
  console.log(params);
  var node = null;
  var card = null;
  if (Object.keys(params).length == 3) {
    node = fetchNodeFromTree(params.l1, output);
    card = fetchCardFromNode(params.l2, node);
  } else {
    if (params.l3 != "$") {
      node = fetchNodeFromTree(params.l2, output);
      card = fetchCardFromNode(params.l3, node);
    } else {
      node = fetchNodeFromTree(params.l2, output);
      card = getFirstCard(node, node.slug);
    }
  }
  console.log(card);

  return card;
}

//functionality to deal with next and previous navigations
export function getPrevNext(output, curSufix) {
//  alert("working");
    var listOfUrls = [];
    let generateAllUrls = function (rootNode, prefix) {
        // Generate all sets of urls for all cards
        for (var i = 0; i < rootNode.listOfCards.length; i++) {
            listOfUrls.push(prefix + rootNode.listOfCards[i]['slug']);
            // console.log(prefix+rootNode.listOfCards[i]['slug']);
        }
        for (var i = 0; i < rootNode.listOfNodes.length; i++) {
            generateAllUrls(rootNode.listOfNodes[i], prefix + rootNode.listOfNodes[i]["slug"] + "/");
        }
    }
    generateAllUrls(output, "");

    var curIndex = listOfUrls.indexOf(curSufix);
    var prev = null;
    var next = null;
    if (curIndex > 0) {
        prev = listOfUrls[curIndex - 1];
    }
    if (curIndex < listOfUrls.length - 1) {
        next = listOfUrls[curIndex + 1]
    }

    return {
        "prev": prev,
        "cur": curSufix,
        "next": next
    };


}

export function getLastCardOfTree(output){
if(output.listOfNodes.length!=0)
  output= output.listOfNodes[output.listOfNodes.length-1];
  if(output.listOfNodes.length>0){
    return getLastCardOfTree(output);

  }
  else{
    return output.listOfCards[output.listOfCards.length - 1];
  }
}
