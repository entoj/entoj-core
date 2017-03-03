<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>
<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<c:set var="className" value="${ model.headline + '\"-teaser\"' }" />
<c:set var="model.nr" value="${ model.id + 1 }" />
<c:set var="simple" value="${ 1.5 }" />
<c:set var="className" value="${ (type) ? (moduleClass + '--' + type) : ('') }" />
