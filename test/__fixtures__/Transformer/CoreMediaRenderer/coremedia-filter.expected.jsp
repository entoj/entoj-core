<%@ page contentType="text/html; charset=UTF-8" session="false" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib prefix="fmt" uri="http://java.sun.com/jsp/jstl/fmt"%>
<%@ taglib prefix="cm" uri="http://www.coremedia.com/2004/objectserver-1.0-2.0"%>
<%@ taglib prefix="bp" uri="http://www.coremedia.com/2012/blueprint"%>
<%@ taglib prefix="tk" uri="http://www.coremedia.com/2016/tk-website" %>
<cm:include self="${ model.text }" view="tkArticle" />
<cm:link var="link" target="${ model.link }" />
<c:set var="text"><cm:include self="${ model.text }" /></c:set>
<jsp:useBean id="globalMediaQueries" class="java.util.TreeMap" /><c:set target="${ globalMediaQueries }" property="applicationAndAbove" value="(min-width: 1280px)" /><c:set target="${ globalMediaQueries }" property="application" value="(min-width: 1280px)" /><c:set target="${ globalMediaQueries }" property="tabletAndBelow" value="(max-width: 1024px)" /><c:set target="${ globalMediaQueries }" property="tabletAndAbove" value="(min-width: 1024px)" /><c:set target="${ globalMediaQueries }" property="tablet" value="(min-width: 1024px) and (max-width: 1024px)" /><c:set target="${ globalMediaQueries }" property="mobileAndBelow" value="(max-width: 375px)" /><c:set target="${ globalMediaQueries }" property="mobile" value="(max-width: 375px)" /><c:set var="mediaQuery" value="${ globalMediaQueries[breakpoint] }" />
<tk:image target="${ self }" var="src" aspect="${ image.aspect }" width="${ image.width }" />
<tk:image target="${ self }" var="src" aspect="${ image.aspect }" width="${ image.width }" height="${ image.height }" />
<tk:image target="${ self }" var="src" />
<c:set var="classes" value="${ moduleClass } ${ not empty type ? moduleClass.concat('--').concat(type) : '' }" />
<c:set var="classes" value="${ moduleClass } ${ not empty type ? moduleClass.concat('--').concat(type) : '' } ${ not empty skin ? moduleClass.concat('--').concat(skin) : '' }" />
<fmt:formatDate value="${ model.date.time }" type="date" pattern="dd.MM.yyyy" />
<fmt:formatDate value="${ model.date.time }" type="date" pattern="dd.MM.yyyy" />
${ tk:hyphenate(model.text) }
