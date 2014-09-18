var a={a:1,b:2,c:"asdf",d:[1,"2",{ad:1}]};
var b={a:2,b:2,c:1,d:[1,"2",{ad:1}]};
function addObjArray(arrayResult,arrayStart,start,end,status){
  var len=arrayResult.length;
  for (var i = 0; i < end-start; i++) {
    if(status==="create"){
      arrayResult[len+i] = diffObject({},arrayStart[i]);
    }else if(status==="remove"){
      arrayResult[len+i] = diffObject(arrayStart[i],{});
    }
  }
  arrayResult[len+end-start]=diffObject(arrayStart[end],arrayStart[end]);
  return arrayResult;
}
function addArray(arrayResult,arrayStart,start,end,status) {
  var len=arrayResult.length;
  for (var i = 0; i < end-start; i++) {
    arrayResult[len+i] = new diff(undefined,arrayStart[start+i],status);
  };
  arrayResult[len+end-start] = new diff(arrayStart[end],arrayStart[end],"nochange");
  return arrayResult;
}
function isArrayObject(arr){
  if(testType(arr)!=="array")return false;
  if (arr.length===0) return true;
  for (var i = 0; i < arr.length; i++) {
    if(testType(arr[i])!=="object") return false;
  };
  return true;
}
function diffArray(arrayA,arrayB){

  var arrayResult=[];
  var i=j=0;
  var lenA=arrayA.length;
  var lenB=arrayB.length;
  if(isArrayObject(arrayA) && isArrayObject(arrayB)){
    while(i<lenA && j<lenB) {
      if (i>=lenA) {
        arrayResult=addObjArray(arrayResult,arrayB,j,lenB,"create");
        return arrayResult;
      };
      if (j>=lenB) {
        arrayResult=addObjArray(arrayResult,arrayA,i,lenA,"remove");
        return arrayResult;
      };
      var resultA=objOfArray(arrayA[i],arrayB,j);
      if(resultA.of){
        //a[i] in arrB is true
        arrayResult = addObjArray(arrayResult,arrayB,j,resultA.index,"create");
        j=resultA.index;
      }else if(resultA.status==="ok"){
        //a[i] in arrB is false
        var resultB=objOfArray(arrayB[j],arrayA,i);
        if (resultB.of) {
          arrayResult = addObjArray(arrayResult,arrayA,i,resultB.index,"remove");
          i=resultB.index;
        }else if(resultB.status==="ok"){
          var len=arrayResult.length;
          arrayResult[len] = diffObject(arrayA[i],arrayB[j]);
        };
      }
      i+=1;
      j+=1;
    }
  }else{
    while(i<lenA && j<lenB) {
      if (i>=lenA) {
        arrayResult=addArray(arrayResult,arrayB,j,lenB,"create");
        return arrayResult;
      };
      if (j>=lenB) {
        arrayResult=addArray(arrayResult,arrayA,i,lenA,"remove");
        return arrayResult;
      };
      var resultA=ptOfArray(arrayA[i],arrayB,j);
      if(resultA.of){
        //a[i] in arrB is true
        arrayResult = addArray(arrayResult,arrayB,j,resultA.index,"create");
        j=resultA.index;
      }else{
        //a[i] in arrB is false
        var resultB=ptOfArray(arrayB[j],arrayA,i);
        if (resultB.of) {
          arrayResult = addArray(arrayResult,arrayA,i,resultB.index,"remove");
          i=resultB.index;
        }else{
          var len=arrayResult.length;
          arrayResult[len] = new diff(arrayA[i],arrayB[j],"change");
        };
      }
      i+=1;
      j+=1;
    }
  };
  return arrayResult;
}
function ptOfArray(pt,arr,start){
  var t={};
  t.of=false;
  for (var i = start; i < arr.length; i++) {
    if(pt===arr[i]){
      t.index=i;
      t.of=true;
      return t
    }
  };
  return t;
}
function objOfArray(obj,arr,start){
  var t={};
  t.status="ok";
  t.of=false;
  if(testType(obj)!=="object" || testType(arr)!=="array") {
    t.status="nottype";
    return t;
  }
  for (var i = start; i < arr.length; i++) {
    if(sameObject(obj,arr[i])){
      t.index=i;
      t.of=true;
      return t;
    }
  };
  return t;
}
//chi so sang object trong array
function sameObject(objectA,objectB){
  if(testType(objectA)!=="object"||testType(objectB)!=="object") {
    return false;
  }
  for(var a in objectA){
    if (testType(objectA[a])==="object") {
      if(!sameObject(objectA[a],objectB[a])) {
        return false;
      }
    }else if (objectA[a]!==objectB[a]) {
      return false;
    }
  }
  for(var b in objectB){
    if (testType(objectB[b])==="object") {
      if(!sameObject(objectA[b],objectB[b])) {
        return false;
      }
    }else if(objectA[b]!==objectB[b]) {
      return false;
    }
  }
  return true;
}
//{a:new diff(old, cur,status)}
function testType(obj) {
  return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
}
function diffType(a,b){
  var obj={};
  obj.array=false;
  obj.object=false;
  obj.typeDiff=true;
  if(testType(a)===testType(b)){
    if (testType(a)==="array") {
      obj.array=true;
      obj.object=false;
    } else if(testType(b)==="object"){
      obj.object=true;
      obj.array=false;
    };
    obj.typeDiff=false;
  };
  return obj;
}

function diff(old,cur,status){
  this.old=old;
  this.cur=cur;
  this.status=status;
}

function diffObject(objectA , objectB){
  var objectT={};
  if(objectA instanceof Object && objectB instanceof Object){
    for(var a in objectA){
      var x=objectA[a],y=objectB[a];
      obj=diffType(x,y);
      //tra ve obj(array:bool,diff:bool)
      if(obj.typeDiff){
        if(y===undefined){
          if(x instanceof Object){
            objectT[a]=diffObject(x,{});
          }else if(x instanceof Array){
            objectT[a]=diffArray(x,[]);
          }else{
            objectT[a]=new diff(x,undefined,"remove");
          };
        }else{
          //chu su ly
          objectT[a]=new diff(x,y,"change");
        }
      }else{
        if (obj.array) {
          objectT[a]=diffArray(x,y);
        }else if(obj.object){
          objectT[a]=diffObject(x,y);
        }else{
          objectT[a]=(x!==y)? (new diff(x,y,"change")): (new diff(x,x,"nochange"));
        };
      }
    }
    for(var b in objectB){
      if(objectA[b]===undefined){
        if(objectB[b] instanceof Object){
          objectT[b]=diffObject({},objectB[b]);
        }else if(objectB[b] instanceof Array){
          objectT[b]=diffArray([],objectB[b]);
        }else{
          objectT[b]= new diff(undefined,objectB[b],"create");
        };
      }
    }
  }
  return objectT;
}
